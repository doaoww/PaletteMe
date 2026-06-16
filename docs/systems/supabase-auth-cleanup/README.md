# Supabase Auth Cleanup

Date shipped: 2026-06-13

## What Shipped

PaletteMe now uses one progressive Supabase auth flow.

- `/login` is the only visible auth screen.
- `/auth` redirects to `/login` and preserves safe `next` and `error` params.
- `/api/auth/callback` is the canonical OAuth/email callback.
- `/auth/callback` forwards legacy callback links to `/api/auth/callback`.
- `proxy.ts` replaces deprecated `middleware.ts` for Supabase session refresh.
- `/api/auth/link` links anonymous quiz/profile data to the authenticated Supabase user.
- `/api/auth/sign-out` clears the Supabase session.
- The profile header uses `SessionAction` to show sign in or sign out.
- `lib/auth-flow.ts` normalizes `next` values so auth cannot redirect users off-site.

## Product Rule

Auth is progressive. Users can finish the quiz and see useful results before signing in. Ask for login when saving profile data, restoring across devices, or using account/history features.

## Files

- `lib/auth-flow.ts`
- `lib/auth-flow.test.ts`
- `proxy.ts`
- `app/login/page.tsx`
- `app/auth/page.tsx`
- `app/auth/callback/route.ts`
- `app/api/auth/callback/route.ts`
- `app/api/auth/link/route.ts`
- `app/api/auth/sign-out/route.ts`
- `components/auth/session-action.tsx`
- `components/auth/save-prompt.tsx`
- `components/profile/profile-view.tsx`
- `components/landing/topbar.tsx`
- `app/profile/page.tsx`
- `next.config.ts`

## Validation

- `node --test --experimental-strip-types`
- `node node_modules\typescript\bin\tsc --noEmit`
- `node node_modules\next\dist\bin\next build`
- Local smoke check with Playwright against `http://localhost:3000/login`, `/auth`, and `/profile`.

## Notes

Supabase OAuth provider settings should include the production equivalent of `/api/auth/callback`. Production RLS/admin policies still need review before paid launch.
