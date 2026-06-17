# Supabase Auth And Storage Check - 2026-06-16

Status: DONE_WITH_CONCERNS

## Symptom

The user asked whether authentication and Supabase storage work because they had not pasted any SQL into the Supabase SQL editor.

## Root Cause

Supabase Auth itself is configured: local env contains `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`, and a temporary Auth smoke test could create and sign in a throwaway user.

Database storage is not currently working through the Supabase REST API. A focused Supabase probe returned `PGRST205 Could not find the table 'public.users' in the schema cache` for `users`, `profiles`, `waitlist`, and `products`, using both anon and service clients. The full app-style smoke test failed at the `users` insert step with the same schema-cache/table-not-found error.

This means the PaletteMe app can reach Supabase Auth, but cannot save/restore quiz/profile rows until the app schema exists in Supabase and is visible to the API.

## Evidence

- Local tests passed: `node --test --experimental-strip-types lib\auth-flow.test.ts lib\post-quiz-supabase.test.ts lib\profile-restore.test.ts lib\supabase-db.test.ts` passed 17/17.
- Env presence check found Supabase URL, anon key, and service role key present in `.env.local`.
- Temporary Auth smoke test:
  - `auth admin create test user OK`
  - `auth anon sign-in OK`
  - cleanup auth user OK
  - failed on `users` insert: `Could not find the table 'public.users' in the schema cache`
- Focused table probe returned `PGRST205` for `users`, `profiles`, `waitlist`, and `products`.

## Required Setup

Run the project SQL in Supabase SQL editor, in order:

1. `docs/schema.sql`
2. `docs/schema-v2.sql`
3. `docs/schema-migration-auth.sql`

After running SQL, refresh/restart the Supabase API schema cache if needed, then rerun the auth/profile smoke check.
