-- style_reports: one row per authenticated user holding their generated
-- style report. Cache + claim/lock table for /api/report/analyze.
--
-- INTENTIONAL MVP DECISION: primary key is user_id alone — one active
-- report per user. No regenerate/multi-report UI exists yet.
--
-- FUTURE MULTI-REPORT PATH: to support more than one report per user,
-- add `report_id UUID DEFAULT gen_random_uuid()`, change the primary key
-- to (user_id, report_id), and add a separate unique index if
-- de-duplication by input (e.g. same photo) is still wanted. This is a
-- schema migration, not a rewrite of the claim logic — the claim helper
-- in lib/server/generation-lock.ts is already keyed generically.

CREATE TABLE IF NOT EXISTS style_reports (
  user_id       UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  status        TEXT NOT NULL DEFAULT 'generating'
                  CHECK (status IN ('generating', 'done', 'failed')),
  full_report   JSONB,
  mini_result   JSONB,
  wardrobe_type TEXT,
  quiz_answers  JSONB,
  attempt_count INT NOT NULL DEFAULT 1,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE style_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "style_reports_select_own"
  ON style_reports FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "style_reports_insert_own"
  ON style_reports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "style_reports_update_own"
  ON style_reports FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS style_reports_status_idx ON style_reports(status);
