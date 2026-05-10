-- Run this in the Supabase SQL editor after creating your project

create table teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  color text not null default '#3b82f6',
  created_at timestamptz not null default now()
);

create table players (
  id uuid primary key default gen_random_uuid(),
  username text not null unique,
  team_id uuid not null references teams(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table tiles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  points integer not null default 1,
  grid_position integer,  -- determines order in the bingo grid
  created_at timestamptz not null default now()
);

create table tile_completions (
  id uuid primary key default gen_random_uuid(),
  tile_id uuid not null references tiles(id) on delete cascade,
  player_id uuid not null references players(id) on delete cascade,
  team_id uuid not null references teams(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz,
  -- one submission per tile per team
  unique (tile_id, team_id)
);

create table event_settings (
  id uuid primary key default gen_random_uuid(),
  event_name text not null default 'OSRS Bingo',
  event_start timestamptz,
  event_end timestamptz
);

-- Seed a default settings row
insert into event_settings (event_name) values ('OSRS Bingo');

-- Row level security (public reads, backend service key handles all writes)
alter table teams enable row level security;
alter table players enable row level security;
alter table tiles enable row level security;
alter table tile_completions enable row level security;
alter table event_settings enable row level security;

create policy "Public read teams" on teams for select using (true);
create policy "Public read players" on players for select using (true);
create policy "Public read tiles" on tiles for select using (true);
create policy "Public read completions" on tile_completions for select using (true);
create policy "Public read settings" on event_settings for select using (true);
