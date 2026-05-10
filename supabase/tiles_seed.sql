-- Tile seed — run in Supabase SQL Editor after schema.sql and schema_v2.sql
-- Multi-piece sets are expanded into individual tiles per piece.
-- trigger_data uses Dink event types for auto-completion via the webhook.
-- Tiles marked with trigger_data = null need manual submission only.

insert into tiles (title, points, category, trigger_data) values

-- ============================================================
-- HIGH LEVEL
-- ============================================================

('KQ Head',                    30,  'high', '{"type":"LOOT","item":"KQ head"}'),
('Sanguinesti Staff',          40,  'high', '{"type":"LOOT","item":"Sanguinesti staff"}'),

-- Armadyl set (3 pieces)
('Armadyl Helmet',             30,  'high', '{"type":"LOOT","item":"Armadyl helmet"}'),
('Armadyl Chestplate',         30,  'high', '{"type":"LOOT","item":"Armadyl chestplate"}'),
('Armadyl Chainskirt',         30,  'high', '{"type":"LOOT","item":"Armadyl chainskirt"}'),

-- Mimic (single tile — requires 3 kills, tracked by kill count)
('3x Mimic Kills',             50,  'high', '{"type":"KILL_COUNT","boss":"The Mimic","min_count":3}'),

-- Smoke Devil & GG (no per-piece breakdown — single tile each)
('3x Smoke Devil Uniques',     40,  'high', null),
('3x Grotesque Guardian Uniques', 40, 'high', null),

('Avernic Hilt',               30,  'high', '{"type":"LOOT","item":"Avernic defender hilt"}'),
('Nightmare Unique',           40,  'high', null),
('Infernal Cape',             100,  'high', '{"type":"COLLECTION","item":"Infernal cape"}'),

-- Godsword hilts (4 pieces)
('Zamorak Godsword Hilt',      30,  'high', '{"type":"LOOT","item":"Zamorak hilt"}'),
('Saradomin Godsword Hilt',    30,  'high', '{"type":"LOOT","item":"Saradomin hilt"}'),
('Bandos Godsword Hilt',       30,  'high', '{"type":"LOOT","item":"Bandos hilt"}'),
('Armadyl Godsword Hilt',      30,  'high', '{"type":"LOOT","item":"Armadyl hilt"}'),

('Dark Bow',                   25,  'high', '{"type":"LOOT","item":"Dark bow"}'),
('Zamorakian Hasta',           30,  'high', '{"type":"LOOT","item":"Zamorakian hasta"}'),

-- 2x Arma unique besides hilt — flagged for clarification, using chestplate + chainskirt
-- NOTE: overlaps with Armadyl set tiles above — confirm if these are separate challenges
('Armadyl Crossbow',           30,  'high', '{"type":"LOOT","item":"Armadyl crossbow"}'),

('Arcane Sigil',               85,  'high', '{"type":"LOOT","item":"Arcane sigil"}'),
('Spectral Sigil',             85,  'high', '{"type":"LOOT","item":"Spectral sigil"}'),
('Elysian Sigil',             105,  'high', '{"type":"LOOT","item":"Elysian sigil"}'),
('Scythe of Vitur',           115,  'high', '{"type":"LOOT","item":"Scythe of vitur"}'),
('Twisted Bow',               115,  'high', '{"type":"LOOT","item":"Twisted bow"}'),
('Tumeken''s Shadow',         115,  'high', '{"type":"LOOT","item":"Tumeken''s shadow"}'),
('Dragon Claws',               35,  'high', '{"type":"LOOT","item":"Dragon claws"}'),

-- Ancestral set (3 pieces)
('Ancestral Hat',              30,  'high', '{"type":"LOOT","item":"Ancestral hat"}'),
('Ancestral Robe Top',         30,  'high', '{"type":"LOOT","item":"Ancestral robe top"}'),
('Ancestral Robe Bottom',      30,  'high', '{"type":"LOOT","item":"Ancestral robe bottom"}'),

('Rapier',                     35,  'high', '{"type":"LOOT","item":"Abyssal tentacle"}'),

-- Justiciar set (3 pieces)
('Justiciar Faceguard',        20,  'high', '{"type":"LOOT","item":"Justiciar faceguard"}'),
('Justiciar Chestguard',       20,  'high', '{"type":"LOOT","item":"Justiciar chestguard"}'),
('Justiciar Legguard',         20,  'high', '{"type":"LOOT","item":"Justiciar legguard"}'),

('Kodai Insignia',             80,  'high', '{"type":"LOOT","item":"Kodai insignia"}'),
('Elder Maul',                 80,  'high', '{"type":"LOOT","item":"Elder maul"}'),
('Arcane Prayer Scroll',       25,  'high', '{"type":"LOOT","item":"Arcane prayer scroll"}'),
('Dexterous Prayer Scroll',    25,  'high', '{"type":"LOOT","item":"Dexterous prayer scroll"}'),
('Dragon Hunter Crossbow',     35,  'high', '{"type":"LOOT","item":"Dragon hunter crossbow"}'),
('Twisted Buckler',            35,  'high', '{"type":"LOOT","item":"Twisted buckler"}'),
('Dinh''s Bulwark',            35,  'high', '{"type":"LOOT","item":"Dinh''s bulwark"}'),
('Masori Crafting Kit',        25,  'high', null),
('Cursed Phalanx',             85,  'high', '{"type":"LOOT","item":"Cursed phalanx"}'),
('Osmumten''s Fang',           35,  'high', '{"type":"LOOT","item":"Osmumten''s fang"}'),
('Lightbearer',                35,  'high', '{"type":"LOOT","item":"Lightbearer"}'),

-- Masori set (3 pieces)
('Masori Mask',                40,  'high', '{"type":"LOOT","item":"Masori mask"}'),
('Masori Body',                40,  'high', '{"type":"LOOT","item":"Masori body"}'),
('Masori Chaps',               40,  'high', '{"type":"LOOT","item":"Masori chaps"}'),

('Elidinis'' Ward',            30,  'high', '{"type":"LOOT","item":"Elidinis'' ward"}'),

-- Oathplate set (3 pieces)
('Oathplate Helm',             40,  'high', '{"type":"LOOT","item":"Oathplate helm"}'),
('Oathplate Body',             40,  'high', '{"type":"LOOT","item":"Oathplate body"}'),
('Oathplate Legs',             40,  'high', '{"type":"LOOT","item":"Oathplate legs"}'),

('Any Pet',                   100,  'high', '{"type":"PET"}'),
('Any Jar',                    50,  'high', '{"type":"LOOT","item_contains":"jar of"}'),

-- Torva set (3 pieces)
('Torva Full Helm',            50,  'high', '{"type":"LOOT","item":"Torva full helm"}'),
('Torva Platebody',            50,  'high', '{"type":"LOOT","item":"Torva platebody"}'),
('Torva Platelegs',            50,  'high', '{"type":"LOOT","item":"Torva platelegs"}'),

('Zaryte Vambraces',           40,  'high', '{"type":"LOOT","item":"Zaryte vambraces"}'),
('Zaryte Crossbow',            80,  'high', '{"type":"LOOT","item":"Zaryte crossbow"}'),
('Quiver',                     90,  'high', '{"type":"LOOT","item":"Dizana''s quiver"}'),
('Avantoe Treads',             80,  'high', null),
('Eye of Ayak',                60,  'high', null),
('Confliction Gauntlet',       60,  'high', null),
('Noxious Halberd',            50,  'high', '{"type":"LOOT","item":"Noxious halberd"}'),
('Amulet of Rancour',          50,  'high', '{"type":"LOOT","item":"Amulet of rancour"}'),
('Occult Necklace',            20,  'high', '{"type":"LOOT","item":"Occult necklace"}'),
('Hydra''s Claws',             40,  'high', '{"type":"LOOT","item":"Hydra''s claw"}'),

-- Cerberus boots (3 pieces)
('Primordial Boots',           30,  'high', '{"type":"LOOT","item":"Primordial crystal"}'),
('Pegasian Boots',             30,  'high', '{"type":"LOOT","item":"Pegasian crystal"}'),
('Eternal Boots',              30,  'high', '{"type":"LOOT","item":"Eternal crystal"}'),

-- DT2 rings (4 pieces)
('Bellator Ring',              40,  'high', '{"type":"LOOT","item":"Bellator vestige"}'),
('Venator Ring',               40,  'high', '{"type":"LOOT","item":"Venator vestige"}'),
('Magus Ring',                 40,  'high', '{"type":"LOOT","item":"Magus vestige"}'),
('Ultor Ring',                 40,  'high', '{"type":"LOOT","item":"Ultor vestige"}'),

('Soulreaper Axe',             85,  'high', '{"type":"LOOT","item":"Soulreaper axe"}'),
('Trident of the Seas',        20,  'high', '{"type":"LOOT","item":"Uncharged trident"}'),
('Armadyl Crossbow',           50,  'high', '{"type":"LOOT","item":"Armadyl crossbow"}'),
('Tonalztics of Ralos',        60,  'high', '{"type":"LOOT","item":"Tonalztics of ralos"}'),

-- Sunfire outfit (3 pieces)
('Sunfire Fanatic Helm',       30,  'high', '{"type":"LOOT","item":"Sunfire fanatic helm"}'),
('Sunfire Fanatic Cuirass',    30,  'high', '{"type":"LOOT","item":"Sunfire fanatic cuirass"}'),
('Sunfire Fanatic Chausses',   30,  'high', '{"type":"LOOT","item":"Sunfire fanatic chausses"}'),

('3x Unsired',                 45,  'high', null),

-- Virtus pieces (3 pieces)
('Virtus Mask',                40,  'high', '{"type":"LOOT","item":"Virtus mask"}'),
('Virtus Robe Top',            40,  'high', '{"type":"LOOT","item":"Virtus robe top"}'),
('Virtus Robe Bottom',         40,  'high', '{"type":"LOOT","item":"Virtus robe bottom"}'),

('Ancient Wyvern Shield',      50,  'high', '{"type":"LOOT","item":"Ancient wyvern shield"}'),

-- ============================================================
-- MID LEVEL
-- ============================================================

('Draconic Visage',            50,  'mid',  '{"type":"LOOT","item":"Draconic visage"}'),
('Dragon Chainbody',           35,  'mid',  '{"type":"LOOT","item":"Dragon chainbody"}'),
('Magic Fang',                 30,  'mid',  '{"type":"LOOT","item":"Magic fang"}'),
('Tanzanite Fang',             30,  'mid',  '{"type":"LOOT","item":"Tanzanite fang"}'),

-- Mutagens (2 pieces)
('Tanzanite Mutagen',          25,  'mid',  '{"type":"LOOT","item":"Tanzanite mutagen"}'),
('Magma Mutagen',              25,  'mid',  '{"type":"LOOT","item":"Magma mutagen"}'),

('Serpentine Visage',          30,  'mid',  '{"type":"LOOT","item":"Serpentine visage"}'),
('Dragon 2H Sword',            30,  'mid',  '{"type":"LOOT","item":"Dragon 2h sword"}'),
('Fighter Torso',              30,  'mid',  '{"type":"LOOT","item":"Fighter torso"}'),
('Mage Arena Cape',            20,  'mid',  null),
('Soul Cape',                  40,  'mid',  null),

-- Voidwaker (3 pieces)
('Voidwaker Blade',            40,  'mid',  '{"type":"LOOT","item":"Voidwaker blade"}'),
('Voidwaker Gem',              40,  'mid',  '{"type":"LOOT","item":"Voidwaker gem"}'),
('Voidwaker Handle',           40,  'mid',  '{"type":"LOOT","item":"Voidwaker handle"}'),

-- Wildy rings (3 of 4)
('Berserker Ring (Wildy)',      30,  'mid',  '{"type":"LOOT","item":"Berserker ring"}'),
('Archers Ring (Wildy)',        30,  'mid',  '{"type":"LOOT","item":"Archers ring"}'),
('Seers Ring (Wildy)',          30,  'mid',  '{"type":"LOOT","item":"Seers ring"}'),

-- DKS rings (3 pieces)
('Berserker Ring (DKS)',        30,  'mid',  '{"type":"LOOT","item":"Berserker ring"}'),
('Archers Ring (DKS)',          30,  'mid',  '{"type":"LOOT","item":"Archers ring"}'),
('Seers Ring (DKS)',            30,  'mid',  '{"type":"LOOT","item":"Seers ring"}'),

('Dragon Pickaxe',             25,  'mid',  '{"type":"LOOT","item":"Dragon pickaxe"}'),
('Ring of Endurance',          50,  'mid',  '{"type":"LOOT","item":"Ring of endurance (uncharged)"}'),

-- Zenytes (4 items — crafted from Zenyte shard)
('Necklace of Anguish',        20,  'mid',  '{"type":"LOOT","item":"Zenyte shard"}'),
('Amulet of Torture',          20,  'mid',  '{"type":"LOOT","item":"Zenyte shard"}'),
('Ring of Suffering',          20,  'mid',  '{"type":"LOOT","item":"Zenyte shard"}'),
('Tormented Bracelet',         20,  'mid',  '{"type":"LOOT","item":"Zenyte shard"}'),

('Burning Claws',              25,  'mid',  '{"type":"LOOT","item":"Burning claws"}'),

-- Tormented Synapse (3 pieces)
('Tormented Synapse (Anguish)',  30, 'mid', '{"type":"LOOT","item":"Tormented synapse"}'),
('Tormented Synapse (Torture)', 30, 'mid',  '{"type":"LOOT","item":"Tormented synapse"}'),
('Tormented Synapse (Suffering)',30, 'mid', '{"type":"LOOT","item":"Tormented synapse"}'),

('Full Hueycoatl Set',         75,  'mid',  null),
('Dragon Hunter Wand',         50,  'mid',  '{"type":"LOOT","item":"Dragon hunter wand"}');

-- ============================================================
-- NOTE: Paste remaining tile categories here when ready
-- ============================================================
