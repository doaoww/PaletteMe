# 02 - Proxy And Callback

## Goal

Move Supabase session refresh to Next 16 `proxy.ts` and make `/api/auth/callback` the single callback endpoint.

## Steps

- [ ] Create `proxy.ts` from the existing middleware behavior.
- [ ] Delete `middleware.ts`.
- [ ] Update `/api/auth/callback` to use the redirect helper.
- [ ] Change `/auth/callback` into a compatibility redirect.

## Acceptance

Next build no longer warns about deprecated middleware, and old callback links still reach the canonical endpoint.
