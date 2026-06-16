# 03 - Login And Session UI

## Goal

Use `/login` as the only auth surface and add sign-out support where users expect it.

## Steps

- [ ] Redirect `/auth` to `/login`.
- [ ] Update `/login` OAuth and email confirmation redirects to `/api/auth/callback`.
- [ ] Add `/api/auth/sign-out`.
- [ ] Replace the profile header's static sign-in link with session-aware sign in/sign out.

## Acceptance

Users can sign in, save/restore their profile, and sign out without seeing duplicate auth screens.
