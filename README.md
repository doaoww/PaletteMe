# PaletteMe

PaletteMe is a personal color analysis and shopping assistant. Users complete a quiz or upload a selfie, get their seasonal color direction, then unlock deeper guidance and shopping/outfit checks.

## Current Product Direction

The current launch plan is documented in:

- `docs/TRACKER.yaml`
- `docs/plans/2026-06-13-monetization-affiliate-launch/plan.md`
- `docs/superpowers/specs/2026-06-13-monetization-affiliate-design.md`

The product model:

- Free result: macro season, short explanation, a small palette preview.
- Paid report: exact sub-season, full palette, avoid colors, makeup, jewelry, hair, and shopping guidance.
- Pro subscription: outfit scanner and before-you-buy product scanner.
- Affiliate links: ready for Rakuten, Awin, Amazon, or other programs once approvals arrive.

## Stack

- Next.js 16 App Router
- React 19
- Tailwind v4 CSS-first styling
- Supabase for auth and persistence
- GPT-4o for serious image analysis
- Gemini fallback where already wired
- Stripe Payment Links for first payment validation
- Affiliate URL wrapping for product links

## Local Development

Install dependencies:

```bash
npm install
```

Run the dev server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

If the global `npm` shim is broken on this machine, use local binaries directly, for example:

```powershell
.\node_modules\.bin\next.cmd dev
.\node_modules\.bin\eslint.cmd
.\node_modules\.bin\next.cmd build
```

## Environment Variables

AI:

```env
OPENAI_API_KEY=
GEMINI_API_KEY=
```

Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Payments:

```env
NEXT_PUBLIC_PAID_REPORT_URL=
NEXT_PUBLIC_SUBSCRIPTION_URL=
```

Affiliate:

```env
AFFILIATE_ENABLED=false
AFFILIATE_NETWORK=
RAKUTEN_SITE_ID=
RAKUTEN_ASOS_MID=
AWIN_PUBLISHER_ID=
AWIN_ASOS_MID=
AMAZON_ASSOCIATE_TAG=
```

Notifications:

```env
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
```

## Important Rules

- Do not create `tailwind.config.js`; Tailwind v4 tokens live in CSS.
- Do not import server-only code into client components.
- Do not claim photos never leave the device. AI analysis sends photos to server-side providers.
- Do not block launch on affiliate approvals. Product links must work without affiliate env vars.
- Keep `docs/TRACKER.yaml` updated when plan state changes.
