-- report_visuals: one row per (user, slot) — claim/lock + cache table
-- for /api/report/generate-visual. Mirrors style_reports' status
-- machinery exactly (see lib/server/generation-lock.ts).

CREATE TABLE IF NOT EXISTS report_visuals (
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  slot_id       TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'generating'
                  CHECK (status IN ('generating', 'done', 'failed')),
  image_url     TEXT,
  attempt_count INT NOT NULL DEFAULT 1,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, slot_id)
);

ALTER TABLE report_visuals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "report_visuals_select_own"
  ON report_visuals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "report_visuals_insert_own"
  ON report_visuals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "report_visuals_update_own"
  ON report_visuals FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS report_visuals_status_idx ON report_visuals(status);
