from fastapi import FastAPI, HTTPException, Depends, Header, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from supabase import create_client, Client
from dotenv import load_dotenv
from typing import Optional
import httpx
import json
import time
import os

load_dotenv()

app = FastAPI(title="OSRS Bingo API")

# Simple in-memory TTL cache for high-traffic read endpoints
_cache: dict = {}
CACHE_TTL = 15  # seconds

def cached(key: str, fn):
    entry = _cache.get(key)
    if entry and time.time() - entry["ts"] < CACHE_TTL:
        return entry["data"]
    data = fn()
    _cache[key] = {"data": data, "ts": time.time()}
    return data

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

supabase: Client = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_SERVICE_KEY"),
)


def verify_admin(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing authorization header")
    token = authorization.split(" ")[1]
    try:
        user = supabase.auth.get_user(token)
        return user.user
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")


# ---------------------------------------------------------------------------
# Public routes
# ---------------------------------------------------------------------------

@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.get("/api/settings")
def get_settings():
    return cached("settings", lambda: (
        supabase.table("event_settings").select("event_name, event_start, event_end").limit(1).execute().data or [{}]
    )[0])


@app.get("/api/players")
def get_players():
    result = (
        supabase.table("players")
        .select("id, username, team_id, teams(name, color)")
        .order("username")
        .execute()
    )
    return result.data


@app.get("/api/tiles")
def get_tiles():
    result = supabase.table("tiles").select("*").order("grid_position").execute()
    return result.data


@app.get("/api/completions")
def get_completions():
    return cached("completions", lambda: (
        supabase.table("tile_completions")
        .select("id, tile_id, player_id, team_id, status, source, image_url, submitted_at, players(username), tiles(title, points), teams(name)")
        .execute()
        .data
    ))


@app.get("/api/leaderboard/teams")
def team_leaderboard():
    def _compute():
        teams = supabase.table("teams").select("id, name, color").execute().data
        completions = (
            supabase.table("tile_completions")
            .select("team_id, tiles(points)")
            .eq("status", "approved")
            .execute()
            .data
        )
        scores: dict[str, int] = {}
        for c in completions:
            tid = c["team_id"]
            scores[tid] = scores.get(tid, 0) + (c["tiles"]["points"] if c["tiles"] else 0)
        return sorted(
            [{"id": t["id"], "name": t["name"], "color": t["color"], "points": scores.get(t["id"], 0)} for t in teams],
            key=lambda x: x["points"],
            reverse=True,
        )
    return cached("leaderboard_teams", _compute)


@app.get("/api/leaderboard/players")
def player_leaderboard():
    def _compute():
        players = supabase.table("players").select("id, username, team_id, teams(name, color)").execute().data
        completions = (
            supabase.table("tile_completions")
            .select("player_id, tiles(points)")
            .eq("status", "approved")
            .execute()
            .data
        )
        scores: dict[str, int] = {}
        for c in completions:
            pid = c["player_id"]
            scores[pid] = scores.get(pid, 0) + (c["tiles"]["points"] if c["tiles"] else 0)

        def team_obj(p):
            tid = p.get("team_id")
            t = p.get("teams")
            return {"id": tid, **(t or {})} if tid and t else None

        return sorted(
            [{"id": p["id"], "username": p["username"], "team": team_obj(p), "points": scores.get(p["id"], 0)} for p in players],
            key=lambda x: x["points"],
            reverse=True,
        )
    return cached("leaderboard_players", _compute)


# ---------------------------------------------------------------------------
# Dink webhook — auto-completes tiles based on in-game events
# ---------------------------------------------------------------------------

def _match_trigger(trigger: dict, event_type: str, extra: dict) -> bool:
    """Return True if a Dink event satisfies a tile's trigger_data."""
    if not trigger or trigger.get("type") != event_type:
        return False

    if event_type == "LOOT":
        items = extra.get("items", [])
        if "item" in trigger:
            needle = trigger["item"].lower()
            return any(needle == item.get("name", "").lower() for item in items)
        if "item_contains" in trigger:
            needle = trigger["item_contains"].lower()
            return any(needle in item.get("name", "").lower() for item in items)

    if event_type == "PET":
        if "pet" not in trigger:
            return True  # any pet
        return trigger["pet"].lower() in (extra.get("petName") or "").lower()

    if event_type == "KILL_COUNT":
        boss_match = trigger.get("boss", "").lower() in extra.get("boss", "").lower()
        min_count = trigger.get("min_count", 1)
        return boss_match and extra.get("count", 0) >= min_count

    if event_type == "COLLECTION":
        return trigger.get("item", "").lower() in extra.get("itemName", "").lower()

    if event_type == "QUEST":
        return trigger.get("quest", "").lower() in extra.get("questName", "").lower()

    if event_type == "LEVEL":
        skill = trigger.get("skill")
        level = trigger.get("level")
        return bool(skill and level and extra.get("levelledSkills", {}).get(skill) == level)

    if event_type == "COMBAT_ACHIEVEMENT":
        return trigger.get("task", "").lower() in extra.get("task", "").lower()

    if event_type == "DEATH":
        return True

    return False


async def _upload_screenshot(file) -> Optional[str]:
    try:
        content = await file.read()
        ext = (file.filename or "screenshot.png").rsplit(".", 1)[-1]
        path = f"dink/{int(time.time() * 1000)}.{ext}"
        supabase.storage.from_("completion-images").upload(
            path, content, {"content-type": file.content_type or "image/png"}
        )
        return supabase.storage.from_("completion-images").get_public_url(path)
    except Exception:
        return None


@app.post("/api/webhooks/dink")
async def dink_webhook(request: Request, x_dink_secret: Optional[str] = Header(None)):
    # Optional webhook secret — set DINK_WEBHOOK_SECRET in backend .env to enable
    expected = os.getenv("DINK_WEBHOOK_SECRET")
    if expected and x_dink_secret != expected:
        raise HTTPException(status_code=403, detail="Invalid webhook secret")

    # Dink sends multipart/form-data with fields 'payload_json' and 'file'
    content_type = request.headers.get("content-type", "")
    image_url = None
    if "multipart/form-data" in content_type:
        form = await request.form()
        payload = json.loads(form.get("payload_json", "{}"))
        file = form.get("file")
        if file and hasattr(file, "read"):
            image_url = await _upload_screenshot(file)
    else:
        body = await request.body()
        payload = json.loads(body) if body else {}

    player_name = payload.get("playerName", "").strip()
    event_type = payload.get("type", "")
    extra = payload.get("extra", {})

    print(f"[dink] player={player_name!r} type={event_type!r}", flush=True)

    if not player_name or not event_type:
        return {"status": "ignored", "reason": "missing playerName or type"}

    # Match player by OSRS username (case-insensitive)
    player_result = (
        supabase.table("players")
        .select("id, team_id")
        .ilike("username", player_name)
        .execute()
    )
    if not player_result.data:
        print(f"[dink] ignored: {player_name!r} not registered", flush=True)
        return {"status": "ignored", "reason": "player not registered"}

    player_id = player_result.data[0]["id"]
    team_id = player_result.data[0]["team_id"]

    # Check all enabled tiles that have triggers defined
    tiles = (
        supabase.table("tiles")
        .select("id, title, trigger_data")
        .not_.is_("trigger_data", "null")
        .neq("disabled", True)
        .execute()
    )

    completed = []
    for tile in tiles.data:
        if not _match_trigger(tile["trigger_data"], event_type, extra):
            continue

        # Skip if this team already has a completion (any status) for this tile
        existing = (
            supabase.table("tile_completions")
            .select("id")
            .eq("tile_id", tile["id"])
            .eq("team_id", team_id)
            .execute()
        )
        if existing.data:
            continue

        supabase.table("tile_completions").insert({
            "tile_id": tile["id"],
            "player_id": player_id,
            "team_id": team_id,
            "status": "approved",
            "source": "dink",
            "image_url": image_url,
        }).execute()
        _cache.pop("completions", None)
        _cache.pop("leaderboard_teams", None)
        _cache.pop("leaderboard_players", None)
        completed.append(tile["title"])

    return {"status": "ok", "completed": completed}


# ---------------------------------------------------------------------------
# Player submission (no auth — admin verification is the trust layer)
# ---------------------------------------------------------------------------

class CompletionSubmit(BaseModel):
    tile_id: str
    player_id: str
    image_url: Optional[str] = None


@app.post("/api/completions", status_code=201)
def submit_completion(payload: CompletionSubmit):
    player = supabase.table("players").select("id, team_id").eq("id", payload.player_id).execute()
    if not player.data:
        raise HTTPException(status_code=404, detail="Player not found")

    team_id = player.data[0]["team_id"]

    existing = (
        supabase.table("tile_completions")
        .select("id, status")
        .eq("tile_id", payload.tile_id)
        .eq("team_id", team_id)
        .in_("status", ["pending", "approved"])
        .execute()
    )
    if existing.data:
        s = existing.data[0]["status"]
        raise HTTPException(status_code=409, detail=f"Tile already {s} for this team")

    result = supabase.table("tile_completions").insert({
        "tile_id": payload.tile_id,
        "player_id": payload.player_id,
        "team_id": team_id,
        "status": "pending",
        "source": "manual",
        "image_url": payload.image_url,
    }).execute()
    return result.data[0]


# ---------------------------------------------------------------------------
# Admin routes
# ---------------------------------------------------------------------------

class TeamCreate(BaseModel):
    name: str
    color: str = "#3b82f6"


@app.get("/api/admin/teams")
def get_teams(admin=Depends(verify_admin)):
    result = supabase.table("teams").select("*, players(id, username)").order("name").execute()
    return result.data


@app.post("/api/admin/teams", status_code=201)
def create_team(team: TeamCreate, admin=Depends(verify_admin)):
    result = supabase.table("teams").insert(team.model_dump()).execute()
    return result.data[0]


@app.patch("/api/admin/teams/{team_id}")
def update_team(team_id: str, team: TeamCreate, admin=Depends(verify_admin)):
    result = supabase.table("teams").update(team.model_dump()).eq("id", team_id).execute()
    return result.data[0]


@app.delete("/api/admin/teams/{team_id}", status_code=204)
def delete_team(team_id: str, admin=Depends(verify_admin)):
    supabase.table("teams").delete().eq("id", team_id).execute()


class PlayerCreate(BaseModel):
    username: str
    team_id: str


@app.post("/api/admin/players", status_code=201)
def create_player(player: PlayerCreate, admin=Depends(verify_admin)):
    result = supabase.table("players").insert(player.model_dump()).execute()
    return result.data[0]


@app.patch("/api/admin/players/{player_id}/team")
def move_player(player_id: str, team_id: str, admin=Depends(verify_admin)):
    result = supabase.table("players").update({"team_id": team_id}).eq("id", player_id).execute()
    return result.data[0]


@app.delete("/api/admin/players/{player_id}", status_code=204)
def delete_player(player_id: str, admin=Depends(verify_admin)):
    supabase.table("players").delete().eq("id", player_id).execute()


class TileCreate(BaseModel):
    title: str
    description: Optional[str] = None
    points: int
    grid_position: Optional[int] = None
    category: Optional[str] = None
    trigger_data: Optional[dict] = None
    disabled: Optional[bool] = None


class TilePatch(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    points: Optional[int] = None
    grid_position: Optional[int] = None
    category: Optional[str] = None
    trigger_data: Optional[dict] = None
    disabled: Optional[bool] = None


class BulkDeleteTiles(BaseModel):
    ids: list[str]


@app.post("/api/admin/tiles", status_code=201)
def create_tile(tile: TileCreate, admin=Depends(verify_admin)):
    result = supabase.table("tiles").insert(tile.model_dump()).execute()
    return result.data[0]


@app.patch("/api/admin/tiles/{tile_id}")
def update_tile(tile_id: str, tile: TilePatch, admin=Depends(verify_admin)):
    data = {k: v for k, v in tile.model_dump().items() if v is not None or k == 'disabled'}
    result = supabase.table("tiles").update(data).eq("id", tile_id).execute()
    return result.data[0]


@app.delete("/api/admin/tiles/{tile_id}", status_code=204)
def delete_tile(tile_id: str, admin=Depends(verify_admin)):
    supabase.table("tiles").delete().eq("id", tile_id).execute()


@app.post("/api/admin/tiles/bulk-delete", status_code=204)
def bulk_delete_tiles(body: BulkDeleteTiles, admin=Depends(verify_admin)):
    if body.ids:
        supabase.table("tiles").delete().in_("id", body.ids).execute()


@app.delete("/api/admin/completions/reset", status_code=204)
def reset_completions(admin=Depends(verify_admin)):
    supabase.table("tile_completions").delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()
    _cache.pop("completions", None)
    _cache.pop("leaderboard_teams", None)
    _cache.pop("leaderboard_players", None)


@app.get("/api/admin/completions")
def get_pending_completions(admin=Depends(verify_admin)):
    result = (
        supabase.table("tile_completions")
        .select("*, players(username), tiles(title, points), teams(name)")
        .eq("status", "pending")
        .order("submitted_at")
        .execute()
    )
    return result.data


@app.patch("/api/admin/completions/{completion_id}")
def review_completion(completion_id: str, status: str, admin=Depends(verify_admin)):
    if status not in ("approved", "rejected"):
        raise HTTPException(status_code=400, detail="status must be 'approved' or 'rejected'")
    result = supabase.table("tile_completions").update({"status": status}).eq("id", completion_id).execute()
    _cache.pop("completions", None)
    _cache.pop("leaderboard_teams", None)
    _cache.pop("leaderboard_players", None)
    return result.data[0]


@app.delete("/api/admin/completions/{completion_id}", status_code=204)
def delete_completion(completion_id: str, admin=Depends(verify_admin)):
    supabase.table("tile_completions").delete().eq("id", completion_id).execute()


@app.get("/api/admin/completions/approved")
def get_approved_completions(admin=Depends(verify_admin)):
    result = (
        supabase.table("tile_completions")
        .select("*, players(username), tiles(title, points), teams(name)")
        .eq("status", "approved")
        .order("submitted_at", desc=True)
        .execute()
    )
    return result.data


class EventSettings(BaseModel):
    event_name: Optional[str] = None
    event_start: Optional[str] = None
    event_end: Optional[str] = None
    dink_config: Optional[dict] = None


@app.get("/api/dink/config")
def get_dink_config():
    result = supabase.table("event_settings").select("dink_config").limit(1).execute()
    if result.data and result.data[0].get("dink_config"):
        return result.data[0]["dink_config"]
    return {}


@app.get("/api/admin/settings")
def get_admin_settings(admin=Depends(verify_admin)):
    result = supabase.table("event_settings").select("*").limit(1).execute()
    return result.data[0] if result.data else {}


@app.patch("/api/admin/settings")
def update_settings(settings: EventSettings, admin=Depends(verify_admin)):
    existing = supabase.table("event_settings").select("id").limit(1).execute()
    data = {k: v for k, v in settings.model_dump().items() if v is not None}
    if existing.data:
        result = supabase.table("event_settings").update(data).eq("id", existing.data[0]["id"]).execute()
    else:
        result = supabase.table("event_settings").insert(data).execute()
    return result.data[0]
