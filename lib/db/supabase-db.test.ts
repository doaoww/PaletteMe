import assert from "node:assert/strict";
import test from "node:test";
import {
  formatSupabaseProfileError,
  isMissingPostgrestRowError,
} from "@/lib/db/supabase-db";

test("recognizes PostgREST missing-row errors separately from database failures", () => {
  assert.equal(isMissingPostgrestRowError({ code: "PGRST116" }), true);
  assert.equal(isMissingPostgrestRowError({ code: "42703" }), false);
  assert.equal(isMissingPostgrestRowError(null), false);
});

test("formats profile-link database errors for route logging", () => {
  assert.equal(
    formatSupabaseProfileError("save profile link", {
      message: 'column users.auth_id does not exist',
      code: "42703",
    }),
    "Could not save profile link: column users.auth_id does not exist"
  );
});
