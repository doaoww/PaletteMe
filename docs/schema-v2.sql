-- PaletteMe v2 schema
-- Run this in the Supabase SQL editor AFTER the original schema.sql
-- These tables are independent of Supabase Auth — users are anonymous, identified by UUID

-- ─── users ───────────────────────────────────────────────────────────────────
-- Anonymous session users. Created on quiz completion, updated after photo analysis.

CREATE TABLE IF NOT EXISTS users (
  id                  UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  colortype           TEXT,
  colortype_confidence INT,
  quiz_answers        JSONB,
  best_colors         TEXT[],
  avoid_colors        TEXT[]
);

-- Permissive RLS — UUID acts as the secret key for MVP
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_insert_anon"
  ON users FOR INSERT
  WITH CHECK (true);

CREATE POLICY "users_select_own"
  ON users FOR SELECT
  USING (true);

CREATE POLICY "users_update_own"
  ON users FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- ─── products ─────────────────────────────────────────────────────────────────
-- Manual entries now; AWIN / Amazon / ASOS sync later via /api/sync/*

CREATE TABLE IF NOT EXISTS products (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name          TEXT NOT NULL,
  image_url     TEXT,
  price         NUMERIC,
  affiliate_url TEXT,
  colortypes    TEXT[],          -- e.g. ["spring", "summer"]
  category      TEXT,            -- tops | bottoms | dresses | coats | jackets | accessories
  colors        TEXT[],          -- first element is primary hex, rest are color names
  styles        TEXT[],          -- minimalist | classic | edgy | romantic | bohemian | casual
  body_types    TEXT[],          -- hourglass | pear | apple | rectangle | inverted-triangle | all
  source        TEXT DEFAULT 'manual',  -- manual | awin | amazon | asos
  source_id     TEXT,
  is_active     BOOLEAN DEFAULT TRUE,
  last_synced   TIMESTAMPTZ DEFAULT NOW()
);

-- Allow public reads; restrict writes to service role in production
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "products_select_all"
  ON products FOR SELECT
  USING (true);

CREATE POLICY "products_insert_anon"
  ON products FOR INSERT
  WITH CHECK (true);

CREATE POLICY "products_update_anon"
  ON products FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- ─── outfit_checks ────────────────────────────────────────────────────────────
-- Stores results of /api/check-outfit calls, keyed to the anonymous user

CREATE TABLE IF NOT EXISTS outfit_checks (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  user_id    UUID REFERENCES users(id) ON DELETE SET NULL,
  result     JSONB NOT NULL
);

ALTER TABLE outfit_checks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "outfit_checks_insert_anon"
  ON outfit_checks FOR INSERT
  WITH CHECK (true);

CREATE POLICY "outfit_checks_select_anon"
  ON outfit_checks FOR SELECT
  USING (true);

-- ─── waitlist ─────────────────────────────────────────────────────────────────
-- Replaces the filesystem store (lib/waitlist-store.ts) which is read-only on Vercel.

CREATE TABLE IF NOT EXISTS waitlist (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email      TEXT UNIQUE NOT NULL,
  source     TEXT DEFAULT 'landing',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "waitlist_insert_anon"
  ON waitlist FOR INSERT
  WITH CHECK (true);

-- wardrobe_items
-- Stores editable user wardrobe labels. AI guesses are less trusted than user corrections.

CREATE TABLE IF NOT EXISTS wardrobe_items (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW(),
  user_id           UUID REFERENCES users(id) ON DELETE SET NULL,
  source            TEXT NOT NULL DEFAULT 'manual',
  name              TEXT NOT NULL,
  category          TEXT NOT NULL,
  colors            TEXT[] DEFAULT ARRAY[]::TEXT[],
  color_temperature TEXT NOT NULL DEFAULT 'unknown',
  season_fit        TEXT[] DEFAULT ARRAY[]::TEXT[],
  formality         TEXT NOT NULL DEFAULT 'unknown',
  notes             TEXT,
  image_url         TEXT,
  corrected_by_user BOOLEAN DEFAULT FALSE
);

ALTER TABLE wardrobe_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "wardrobe_items_insert_anon"
  ON wardrobe_items FOR INSERT
  WITH CHECK (true);

CREATE POLICY "wardrobe_items_select_anon"
  ON wardrobe_items FOR SELECT
  USING (true);

CREATE POLICY "wardrobe_items_update_anon"
  ON wardrobe_items FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- scan_history
-- Stores Scan Anything results. Photos are not stored here, only structured verdict JSON.

CREATE TABLE IF NOT EXISTS scan_history (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  user_id    UUID REFERENCES users(id) ON DELETE SET NULL,
  scan_type  TEXT NOT NULL,
  result     JSONB NOT NULL
);

ALTER TABLE scan_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "scan_history_insert_anon"
  ON scan_history FOR INSERT
  WITH CHECK (true);

CREATE POLICY "scan_history_select_anon"
  ON scan_history FOR SELECT
  USING (true);

-- ─── Indexes ──────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS products_is_active_idx ON products(is_active);
CREATE INDEX IF NOT EXISTS products_source_idx    ON products(source);
CREATE INDEX IF NOT EXISTS outfit_checks_user_idx ON outfit_checks(user_id);
CREATE INDEX IF NOT EXISTS waitlist_email_idx     ON waitlist(email);
CREATE INDEX IF NOT EXISTS wardrobe_items_user_idx ON wardrobe_items(user_id);
CREATE INDEX IF NOT EXISTS scan_history_user_idx   ON scan_history(user_id);
CREATE INDEX IF NOT EXISTS scan_history_created_idx ON scan_history(created_at DESC);


-- ═══════════════════════════════════════════════════════════════════════════════
-- SEED — 20 manually curated ASOS items, 5 per macro season
-- ═══════════════════════════════════════════════════════════════════════════════

INSERT INTO products
  (name, image_url, price, affiliate_url, colortypes, category, colors, styles, body_types, source)
VALUES

-- ── SPRING (5) ───────────────────────────────────────────────────────────────
(
  'Wrap Midi Dress in Coral',
  'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500&q=85&fit=crop',
  59.00,
  'https://www.asos.com/asos-design/asos-design-wrap-midi-dress-in-coral/prd/100000001',
  ARRAY['spring'],
  'dresses',
  ARRAY['#E8735A', 'coral', 'warm orange-pink'],
  ARRAY['feminine', 'romantic', 'classic'],
  ARRAY['hourglass', 'pear', 'rectangle'],
  'manual'
),
(
  'Linen Blouse in Light Yellow',
  'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=500&q=85&fit=crop',
  44.99,
  'https://www.asos.com/asos-design/asos-design-linen-blouse-in-light-yellow/prd/100000002',
  ARRAY['spring'],
  'tops',
  ARRAY['#F9E4A0', 'light yellow', 'warm yellow'],
  ARRAY['casual', 'minimalist'],
  ARRAY['hourglass', 'rectangle', 'inverted-triangle', 'apple'],
  'manual'
),
(
  'Flared Midi Skirt in Warm Peach',
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&q=85&fit=crop',
  52.00,
  'https://www.asos.com/asos-design/asos-design-flared-midi-skirt-in-warm-peach/prd/100000003',
  ARRAY['spring'],
  'bottoms',
  ARRAY['#FFCBA4', 'warm peach', 'peach'],
  ARRAY['feminine', 'romantic'],
  ARRAY['hourglass', 'inverted-triangle', 'rectangle'],
  'manual'
),
(
  'Ribbed Knit Top in Mint Green',
  'https://images.unsplash.com/photo-1483986769511-7bcc11e66f7d?w=500&q=85&fit=crop',
  34.99,
  'https://www.asos.com/asos-design/asos-design-ribbed-knit-top-in-mint-green/prd/100000004',
  ARRAY['spring'],
  'tops',
  ARRAY['#98D8C8', 'mint green', 'soft mint'],
  ARRAY['casual', 'minimalist', 'classic'],
  ARRAY['hourglass', 'pear', 'rectangle', 'inverted-triangle', 'apple'],
  'manual'
),
(
  'Tailored Blazer in Warm Cream',
  'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=500&q=85&fit=crop',
  89.00,
  'https://www.asos.com/asos-design/asos-design-tailored-blazer-in-warm-cream/prd/100000005',
  ARRAY['spring', 'autumn'],
  'jackets',
  ARRAY['#FFF5E0', 'warm cream', 'ivory'],
  ARRAY['classic', 'minimalist'],
  ARRAY['hourglass', 'pear', 'rectangle', 'inverted-triangle', 'apple'],
  'manual'
),

-- ── SUMMER (5) ────────────────────────────────────────────────────────────────
(
  'Wrap Dress in Dusty Rose',
  'https://images.unsplash.com/photo-1483986769511-7bcc11e66f7d?w=500&q=85&fit=crop',
  62.00,
  'https://www.asos.com/asos-design/asos-design-wrap-dress-in-dusty-rose/prd/100000006',
  ARRAY['summer'],
  'dresses',
  ARRAY['#E8B4B8', 'dusty rose', 'muted pink'],
  ARRAY['feminine', 'romantic', 'classic'],
  ARRAY['hourglass', 'pear'],
  'manual'
),
(
  'Wide Leg Trousers in Lavender',
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&q=85&fit=crop',
  54.99,
  'https://www.asos.com/asos-design/asos-design-wide-leg-trousers-in-lavender/prd/100000007',
  ARRAY['summer'],
  'bottoms',
  ARRAY['#C9B6E4', 'lavender', 'soft purple'],
  ARRAY['minimalist', 'classic', 'bohemian'],
  ARRAY['inverted-triangle', 'hourglass', 'rectangle'],
  'manual'
),
(
  'Satin Blouse in Powder Blue',
  'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=500&q=85&fit=crop',
  47.99,
  'https://www.asos.com/asos-design/asos-design-satin-blouse-in-powder-blue/prd/100000008',
  ARRAY['summer'],
  'tops',
  ARRAY['#A8D8EA', 'powder blue', 'soft blue'],
  ARRAY['classic', 'feminine', 'minimalist'],
  ARRAY['hourglass', 'pear', 'rectangle', 'inverted-triangle', 'apple'],
  'manual'
),
(
  'Cashmere Blend Sweater in Mauve',
  'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500&q=85&fit=crop',
  79.00,
  'https://www.asos.com/asos-design/asos-design-cashmere-blend-sweater-in-mauve/prd/100000009',
  ARRAY['summer'],
  'tops',
  ARRAY['#B8A9C9', 'mauve', 'dusty purple-pink'],
  ARRAY['classic', 'minimalist', 'romantic'],
  ARRAY['hourglass', 'pear', 'rectangle', 'inverted-triangle', 'apple'],
  'manual'
),
(
  'Midi Slip Dress in Soft Grey Blue',
  'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=500&q=85&fit=crop',
  57.99,
  'https://www.asos.com/asos-design/asos-design-midi-slip-dress-in-soft-grey-blue/prd/100000010',
  ARRAY['summer'],
  'dresses',
  ARRAY['#9DB4C0', 'soft grey blue', 'muted blue'],
  ARRAY['minimalist', 'classic'],
  ARRAY['rectangle', 'inverted-triangle', 'pear'],
  'manual'
),

-- ── AUTUMN (5) ────────────────────────────────────────────────────────────────
(
  'Oversized Blazer in Terracotta',
  'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=500&q=85&fit=crop',
  84.99,
  'https://www.asos.com/asos-design/asos-design-oversized-blazer-in-terracotta/prd/100000011',
  ARRAY['autumn'],
  'jackets',
  ARRAY['#C96A3A', 'terracotta', 'burnt orange'],
  ARRAY['classic', 'edgy', 'bohemian'],
  ARRAY['pear', 'hourglass', 'rectangle'],
  'manual'
),
(
  'Wrap Coat in Camel',
  'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=500&q=85&fit=crop',
  129.00,
  'https://www.asos.com/asos-design/asos-design-wrap-coat-in-camel/prd/100000012',
  ARRAY['autumn', 'spring'],
  'coats',
  ARRAY['#D4A574', 'camel', 'warm beige'],
  ARRAY['classic', 'minimalist'],
  ARRAY['hourglass', 'pear', 'rectangle', 'inverted-triangle', 'apple'],
  'manual'
),
(
  'Chunky Knit Sweater in Rust',
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&q=85&fit=crop',
  64.99,
  'https://www.asos.com/asos-design/asos-design-chunky-knit-sweater-in-rust/prd/100000013',
  ARRAY['autumn'],
  'tops',
  ARRAY['#A0522D', 'rust', 'warm rust orange'],
  ARRAY['casual', 'bohemian', 'classic'],
  ARRAY['hourglass', 'pear', 'rectangle', 'inverted-triangle', 'apple'],
  'manual'
),
(
  'Midi Dress in Olive Green',
  'https://images.unsplash.com/photo-1483986769511-7bcc11e66f7d?w=500&q=85&fit=crop',
  71.99,
  'https://www.asos.com/asos-design/asos-design-midi-dress-in-olive-green/prd/100000014',
  ARRAY['autumn'],
  'dresses',
  ARRAY['#6B8E23', 'olive green', 'earthy green'],
  ARRAY['bohemian', 'casual', 'classic'],
  ARRAY['rectangle', 'apple', 'hourglass'],
  'manual'
),
(
  'Faux Leather Jacket in Warm Brown',
  'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500&q=85&fit=crop',
  94.99,
  'https://www.asos.com/asos-design/asos-design-faux-leather-jacket-in-warm-brown/prd/100000015',
  ARRAY['autumn', 'winter'],
  'jackets',
  ARRAY['#6F4E37', 'warm brown', 'chocolate brown'],
  ARRAY['edgy', 'classic', 'casual'],
  ARRAY['hourglass', 'pear', 'rectangle', 'inverted-triangle', 'apple'],
  'manual'
),

-- ── WINTER (5) ────────────────────────────────────────────────────────────────
(
  'Tailored Blazer in Black',
  'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=500&q=85&fit=crop',
  89.00,
  'https://www.asos.com/asos-design/asos-design-tailored-blazer-in-black/prd/100000016',
  ARRAY['winter'],
  'jackets',
  ARRAY['#1B1B2F', 'black', 'true black'],
  ARRAY['classic', 'minimalist', 'edgy'],
  ARRAY['hourglass', 'pear', 'rectangle', 'inverted-triangle', 'apple'],
  'manual'
),
(
  'Satin Midi Dress in Cobalt Blue',
  'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500&q=85&fit=crop',
  79.00,
  'https://www.asos.com/asos-design/asos-design-satin-midi-dress-in-cobalt-blue/prd/100000017',
  ARRAY['winter'],
  'dresses',
  ARRAY['#0F3460', 'cobalt blue', 'deep blue'],
  ARRAY['feminine', 'edgy', 'classic'],
  ARRAY['hourglass', 'pear', 'rectangle'],
  'manual'
),
(
  'Oversized Shirt in Pure White',
  'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=500&q=85&fit=crop',
  44.99,
  'https://www.asos.com/asos-design/asos-design-oversized-shirt-in-pure-white/prd/100000018',
  ARRAY['winter'],
  'tops',
  ARRAY['#FFFFFF', 'pure white', 'crisp white'],
  ARRAY['minimalist', 'classic', 'casual'],
  ARRAY['hourglass', 'pear', 'rectangle', 'inverted-triangle', 'apple'],
  'manual'
),
(
  'Midi Skirt in Deep Burgundy',
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&q=85&fit=crop',
  57.99,
  'https://www.asos.com/asos-design/asos-design-midi-skirt-in-deep-burgundy/prd/100000019',
  ARRAY['winter'],
  'bottoms',
  ARRAY['#6A0F2A', 'deep burgundy', 'dark wine'],
  ARRAY['classic', 'edgy', 'feminine'],
  ARRAY['inverted-triangle', 'rectangle', 'hourglass'],
  'manual'
),
(
  'Wrap Dress in Navy',
  'https://images.unsplash.com/photo-1483986769511-7bcc11e66f7d?w=500&q=85&fit=crop',
  64.99,
  'https://www.asos.com/asos-design/asos-design-wrap-dress-in-navy/prd/100000020',
  ARRAY['winter'],
  'dresses',
  ARRAY['#1C3D6E', 'navy', 'deep navy blue'],
  ARRAY['classic', 'feminine', 'minimalist'],
  ARRAY['hourglass', 'pear', 'rectangle'],
  'manual'
);
