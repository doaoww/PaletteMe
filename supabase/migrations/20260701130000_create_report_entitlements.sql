-- report_entitlements: records a confirmed Polar purchase unlocking the full
-- report for a user. Written only by the Polar webhook handler (service-role
-- client, no user session), read by /api/report/full to gate generation.
--
-- INTENTIONAL MVP DECISION: one row per user (mirrors style_reports) --
-- one paid unlock per account. If per-report entitlements are ever needed
-- (e.g. re-unlocking after a new photo), key this on (user_id, report
-- purchase reference) instead.

CREATE TABLE IF NOT EXISTS report_entitlements (
  user_id       UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  polar_order_id TEXT,
  purchased_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE report_entitlements ENABLE ROW LEVEL SECURITY;

-- Only the user can read their own entitlement. No insert/update policy for
-- the anon/authenticated roles -- writes happen exclusively via the
-- service-role client in the webhook handler, which bypasses RLS entirely.
CREATE POLICY "report_entitlements_select_own"
  ON report_entitlements FOR SELECT
  USING (auth.uid() = user_id);
