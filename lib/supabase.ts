import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// ─── Types mirroring the DB schema ────────────────────────────────────────

export type DbProfile = {
  id: string;
  color_season: string | null;
  undertone: string | null;
  contrast: string | null;
  intensity: string | null;
  best_colors: string[] | null;
  avoid_colors: string[] | null;
  neutrals: string[] | null;
  body_type: string | null;
  style_vector: Record<string, string[]> | null;
  sub_season: string | null;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
};

export type DbInteraction = {
  id: string;
  user_id: string;
  product_id: string;
  action: "click" | "save" | "dismiss";
  created_at: string;
};
