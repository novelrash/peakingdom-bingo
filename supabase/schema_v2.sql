-- Run this in Supabase SQL Editor after schema.sql is already applied

-- Tiles: add trigger_data to define what Dink event auto-completes this tile
alter table tiles add column if not exists trigger_data jsonb;
alter table tiles add column if not exists category text; -- 'high', 'mid', 'low'

-- Completions: track where the completion came from and allow auto-approval
alter table tile_completions add column if not exists source text not null default 'manual'
  check (source in ('manual', 'dink'));

-- Dink completions skip the approval queue; manual ones go through admin review
-- status is already set to 'pending' by default — Dink endpoint sets it to 'approved'

-- Webhook secret for Dink (optional but recommended)
-- Set DINK_WEBHOOK_SECRET env var in your backend to require it
