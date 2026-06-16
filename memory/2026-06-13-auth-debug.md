# Auth Debug Report - 2026-06-13

Status: DONE

## Symptom

Authentication failures were not presented cleanly to users. A Supabase/network failure on `/login` fell through to generic copy, and profile-link failures used internal Supabase migration wording.

## Root Cause

Auth surfaces called Supabase directly without a shared public-config guard and without handling all common Supabase failure strings. `friendlyAuthError` did not recognize `Failed to fetch`, provider-disabled, or redirect-url setup errors. The canonical callback also created a Supabase server client without first checking public auth configuration.

## Fix

- Added shared Supabase auth config detection and friendlier auth/profile error mappings in `lib/auth-flow.ts`.
- Added regression coverage in `lib/auth-flow.test.ts`.
- Guarded Google and email auth entry points in `/login`, `SavePrompt`, and the profile save banner.
- Guarded `/api/auth/callback` so callback failures redirect safely to `/login`.

## Evidence

- `node --test --experimental-strip-types lib\auth-flow.test.ts` failed before the helper changes and passed after.
- `node --test --experimental-strip-types` passed: 73/73 tests.
- `node node_modules\typescript\bin\tsc --noEmit` passed.
- `node_modules\.bin\eslint.cmd` passed.
- `node node_modules\next\dist\bin\next build` passed.
- Browser smoke against `http://localhost:3000/login` showed: "Sign-in is unavailable right now. Keep using PaletteMe without an account, or try again in a little while."
- `/api/auth/callback?code=fake-code&next=/profile` returned `307` to `/login?error=auth_failed&next=%2Fprofile`.

## Related Notes

Supabase OAuth settings still need to include local and production callback URLs ending in `/api/auth/callback`. The app now handles failures gracefully, but provider settings must still be correct for Google/email callback auth to succeed.
