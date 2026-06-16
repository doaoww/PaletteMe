-- PaletteMe — Auth migration
-- Run this in the Supabase SQL editor AFTER schema-v2.sql
-- Adds auth linking columns to the anonymous users table

ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_id UUID REFERENCES auth.users(id);
ALTER TABLE users ADD COLUMN IF NOT EXISTS email    TEXT;

CREATE INDEX IF NOT EXISTS idx_users_auth_id ON users(auth_id);
CREATE INDEX IF NOT EXISTS idx_users_email   ON users(email);
