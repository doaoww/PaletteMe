# 01 - Auth Redirect Contracts

## Goal

Add a tiny shared helper for auth callback URLs and safe post-auth redirects.

## Steps

- [ ] Add failing tests for safe internal redirects, unsafe external redirects, and callback URL building.
- [ ] Run `node --test --experimental-strip-types lib/auth-flow.test.ts` and confirm the helper is missing.
- [ ] Implement `lib/auth-flow.ts`.
- [ ] Re-run the auth helper test and confirm it passes.

## Acceptance

The app never trusts a raw `next` query string when redirecting after auth.
