-- Run this in Supabase SQL editor after creating your project

-- profiles table (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  color_season TEXT,
  undertone TEXT,
  contrast TEXT,
  intensity TEXT,
  best_colors TEXT[],
  avoid_colors TEXT[],
  neutrals TEXT[],
  body_type TEXT,
  style_vector JSONB,
  sub_season TEXT,
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- product_cache table
CREATE TABLE product_cache (
  id TEXT PRIMARY KEY,
  data JSONB,
  cached_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

-- user_interactions table
CREATE TABLE user_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  product_data JSONB,
  action TEXT NOT NULL CHECK (action IN ('click', 'save', 'dismiss')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX profiles_color_season_idx ON profiles(color_season);
CREATE INDEX user_interactions_user_id_idx ON user_interactions(user_id);
CREATE INDEX user_interactions_action_idx ON user_interactions(user_id, action);
CREATE INDEX product_cache_expires_idx ON product_cache(expires_at);

-- Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_interactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users can read own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "users can insert own profile"
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "users can read own interactions"
  ON user_interactions FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "users can insert own interactions"
  ON user_interactions FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users can delete own interactions"
  ON user_interactions FOR DELETE USING (auth.uid() = user_id);

-- Auto-create profile row on sign-up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO profiles (id) VALUES (NEW.id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE PROCEDURE touch_updated_at();
