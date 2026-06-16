# Supabase Auth Cleanup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make PaletteMe auth feel simple and reliable by consolidating Supabase login, callback, session refresh, saved-profile linking, and sign out.

**Architecture:** Keep quiz/results free and progressively ask for auth only when saving profile/history. Use `/login` as the single UI, `/api/auth/callback` as the canonical Supabase callback, and Next 16 `proxy.ts` for session refresh. Shared redirect helpers prevent unsafe `next` values.

**Tech Stack:** Next.js 16 App Router and proxy, React 19 client components, `@supabase/ssr`, Supabase Auth, Node test runner.

---

## Files

- Create `lib/auth-flow.ts` for safe auth redirect helpers.
- Create `lib/auth-flow.test.ts` for redirect safety coverage.
- Modify `app/login/page.tsx` to use the canonical callback and safe `next` path.
- Replace `app/auth/page.tsx` with a redirect to `/login`.
- Modify `app/api/auth/callback/route.ts` to normalize callback destinations.
- Modify `app/auth/callback/route.ts` to forward legacy links to the canonical callback.
- Create `app/api/auth/sign-out/route.ts` for sign out.
- Replace `middleware.ts` with Next 16 `proxy.ts`.
- Modify `components/profile/profile-view.tsx` to show sign in/sign out session action.
- Update `LOGIC.md`, `AGENTS.md`, and this tracker entry.

## Success Criteria

- `/login` is the only auth UI.
- `/auth` redirects to `/login` so old links still work.
- `/api/auth/callback` is the canonical Supabase callback.
- `next` query values cannot redirect users off-site.
- Session refresh uses `proxy.ts`, removing the Next 16 middleware warning.
- Signed-in users can sign out from the profile header.
- Tests, TypeScript, and Next build pass.
