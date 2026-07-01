import assert from "node:assert/strict";
import test from "node:test";
import { POST } from "./route.ts";

test("returns 401 when there is no Supabase session", async () => {
  // No Supabase env configured in the test process -> createClient() still
  // constructs a client, but auth.getUser() resolves to { user: null } when
  // there's no session cookie on the request. This exercises the real
  // early-return path without needing a live database.
  const req = new Request("http://localhost/api/report/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ photoDataUrl: "data:image/png;base64,AA==", wardrobeType: "woman" }),
  });
  const res = await POST(req);
  assert.equal(res.status, 401);
});
