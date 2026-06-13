# Real-Photo Wardrobe Avatar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first real-photo wardrobe planner: full-body avatar photo, 5 to 10 favorite pieces, editable wardrobe labels, outfit builder, and a person-like preview that is clearly not exact photoreal try-on.

**Architecture:** Extend the existing wardrobe and outfit foundations rather than replacing them. Add avatar and outfit-save schemas, local fallback storage plus Supabase hooks, route handlers, and mobile-first `/wardrobe` and `/outfits` surfaces that reuse the native app shell.

**Tech Stack:** Next.js 16 route handlers with `runtime = "nodejs"`, React 19 client components, Zod v4 schemas, Supabase with local fallback, OpenAI Responses API through existing server helpers, Node test runner.

---

## File Structure

- Modify `lib/server/ai/schemas.ts`: add avatar and saved outfit schemas.
- Modify `lib/server/ai/schemas.test.ts`: test new schemas.
- Modify `lib/supabase-db.ts`: add optional DB persistence for avatar and outfit saves.
- Modify `lib/server/wardrobe.ts`: add local fallback helpers for avatar and saved outfits.
- Modify `lib/server/wardrobe.test.ts`: test local avatar, wardrobe correction, and saved outfit behavior.
- Create `app/api/avatar/route.ts`: save and read avatar profile metadata.
- Modify `app/api/wardrobe/route.ts`: keep item save/correction and ensure friendly errors.
- Create `app/api/outfits/saved/route.ts`: save and list outfit plans.
- Create `lib/wardrobe-client.ts`: browser-safe upload validation and local draft helpers.
- Create `lib/wardrobe-client.test.ts`: validate file and local draft behavior.
- Create `components/wardrobe/*`: onboarding, avatar step, upload step, item cards, editor, builder, preview, verdict.
- Create `app/wardrobe/page.tsx`: wardrobe onboarding/catalog route.
- Create `app/outfits/page.tsx`: outfit builder route.
- Modify `components/app/app-ui.tsx`: wire wardrobe module to `/wardrobe`.
- Modify `docs/PRODUCT-SPEC.md` and `LOGIC.md`: document real-photo wardrobe avatar v1.

---

### Task 1: Schemas For Avatar And Saved Outfits

**Files:**
- Modify: `lib/server/ai/schemas.ts`
- Modify: `lib/server/ai/schemas.test.ts`

- [ ] **Step 1: Add failing schema tests**

Append to `lib/server/ai/schemas.test.ts`:

```ts
import { AvatarProfileSchema, SavedOutfitSchema } from "./schemas.ts";

test("avatar profile stores a real-photo planning anchor", () => {
  const parsed = AvatarProfileSchema.parse({
    id: "avatar-1",
    userId: "user-1",
    photoUrl: "https://example.com/avatar.jpg",
    thumbnailUrl: "https://example.com/avatar-thumb.jpg",
    photoQuality: "usable",
    createdAt: "2026-06-14T00:00:00.000Z",
    updatedAt: "2026-06-14T00:00:00.000Z",
  });

  assert.equal(parsed.photoQuality, "usable");
});

test("saved outfit stores owned item ids and practical verdict", () => {
  const parsed = SavedOutfitSchema.parse({
    id: "outfit-save-1",
    userId: "user-1",
    title: "dinner outfit",
    occasion: "dinner",
    itemIds: ["top-1", "bottom-1", "shoe-1"],
    lockedItemIds: ["top-1"],
    verdict: "balance_it",
    score: 78,
    confidence: 82,
    reason: "The colors work together, but the top needs a warmer accessory.",
    nextAction: "Add a warm metal necklace or swap the shoes.",
    createdAt: "2026-06-14T00:00:00.000Z",
    updatedAt: "2026-06-14T00:00:00.000Z",
  });

  assert.deepEqual(parsed.itemIds, ["top-1", "bottom-1", "shoe-1"]);
});
```

- [ ] **Step 2: Run failing tests**

Run:

```bash
npm test -- lib/server/ai/schemas.test.ts
```

Expected: fails because `AvatarProfileSchema` and `SavedOutfitSchema` are missing.

- [ ] **Step 3: Add schemas**

In `lib/server/ai/schemas.ts`, add:

```ts
export const AvatarPhotoQualitySchema = z.enum(["usable", "needs_better_photo", "skipped"]);

export const AvatarProfileSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1).optional().nullable(),
  photoUrl: z.string().url().optional().nullable(),
  thumbnailUrl: z.string().url().optional().nullable(),
  photoQuality: AvatarPhotoQualitySchema.default("skipped"),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
});

export type AvatarProfile = z.infer<typeof AvatarProfileSchema>;

export const SavedOutfitVerdictSchema = z.enum(["wear_it", "balance_it", "swap_one_item", "unclear"]);

export const SavedOutfitSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1).optional().nullable(),
  title: z.string().min(1),
  occasion: z.string().min(1).default("everyday"),
  itemIds: z.array(z.string().min(1)).min(1),
  lockedItemIds: z.array(z.string().min(1)).default([]),
  verdict: SavedOutfitVerdictSchema,
  score: z.number().int().min(0).max(100),
  confidence: z.number().int().min(0).max(100),
  reason: z.string().min(8),
  nextAction: z.string().min(3),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
});

export type SavedOutfit = z.infer<typeof SavedOutfitSchema>;
```

- [ ] **Step 4: Verify tests pass**

Run:

```bash
npm test -- lib/server/ai/schemas.test.ts
```

Expected: pass.

- [ ] **Step 5: Commit**

```bash
git add lib/server/ai/schemas.ts lib/server/ai/schemas.test.ts
git commit -m "feat: add avatar and saved outfit schemas"
```

---

### Task 2: Server Storage With Local Fallback

**Files:**
- Modify: `lib/server/wardrobe.ts`
- Modify: `lib/server/wardrobe.test.ts`
- Modify: `lib/supabase-db.ts`

- [ ] **Step 1: Add local fallback tests**

Append to `lib/server/wardrobe.test.ts`:

```ts
import {
  getAvatarProfile,
  listSavedOutfits,
  saveAvatarProfile,
  saveSavedOutfit,
} from "./wardrobe.ts";

test("saves avatar profile with local fallback", () => {
  clearWardrobeForTest();
  const avatar = saveAvatarProfile({
    userId: "user-1",
    photoUrl: "https://example.com/avatar.jpg",
    thumbnailUrl: "https://example.com/avatar-thumb.jpg",
    photoQuality: "usable",
  });

  assert.equal(getAvatarProfile("user-1")?.id, avatar.id);
});

test("saves outfits with owned item ids", () => {
  clearWardrobeForTest();
  const saved = saveSavedOutfit({
    userId: "user-1",
    title: "easy dinner",
    occasion: "dinner",
    itemIds: ["top-1", "bottom-1"],
    lockedItemIds: ["top-1"],
    verdict: "wear_it",
    score: 88,
    confidence: 80,
    reason: "The colors and formality work well together.",
    nextAction: "Save this for dinner.",
  });

  assert.equal(saved.verdict, "wear_it");
  assert.equal(listSavedOutfits("user-1").length, 1);
});
```

- [ ] **Step 2: Run failing tests**

Run:

```bash
npm test -- lib/server/wardrobe.test.ts
```

Expected: fails because avatar and saved outfit helpers are missing.

- [ ] **Step 3: Implement local fallback helpers**

In `lib/server/wardrobe.ts`, import new types and add:

```ts
import {
  AvatarProfileSchema,
  SavedOutfitSchema,
  type AvatarProfile,
  type SavedOutfit,
} from "./ai/schemas.ts";

export type SaveAvatarProfileInput = Omit<AvatarProfile, "id" | "createdAt" | "updatedAt"> & {
  id?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type SaveSavedOutfitInput = Omit<SavedOutfit, "id" | "createdAt" | "updatedAt"> & {
  id?: string;
  createdAt?: string;
  updatedAt?: string;
};

const avatarProfiles = new Map<string, AvatarProfile>();
const savedOutfits = new Map<string, SavedOutfit>();

export function saveAvatarProfile(input: SaveAvatarProfileInput): AvatarProfile {
  const now = new Date().toISOString();
  const profile = AvatarProfileSchema.parse({
    ...input,
    id: input.id ?? crypto.randomUUID(),
    createdAt: input.createdAt ?? now,
    updatedAt: input.updatedAt ?? now,
  });
  avatarProfiles.set(profile.userId ?? profile.id, profile);
  return profile;
}

export function getAvatarProfile(userId?: string | null): AvatarProfile | null {
  if (!userId) return null;
  return avatarProfiles.get(userId) ?? null;
}

export function saveSavedOutfit(input: SaveSavedOutfitInput): SavedOutfit {
  const now = new Date().toISOString();
  const outfit = SavedOutfitSchema.parse({
    ...input,
    id: input.id ?? crypto.randomUUID(),
    createdAt: input.createdAt ?? now,
    updatedAt: input.updatedAt ?? now,
  });
  savedOutfits.set(outfit.id, outfit);
  return outfit;
}

export function listSavedOutfits(userId?: string | null): SavedOutfit[] {
  return [...savedOutfits.values()].filter((outfit) => {
    if (!userId) return !outfit.userId;
    return outfit.userId === userId;
  });
}
```

Update `clearWardrobeForTest()`:

```ts
export function clearWardrobeForTest(): void {
  wardrobeItems.clear();
  avatarProfiles.clear();
  savedOutfits.clear();
}
```

- [ ] **Step 4: Add Supabase stubs with graceful fallback**

In `lib/supabase-db.ts`, add exported functions that return `null` until the migration exists:

```ts
import type { AvatarProfile, SavedOutfit } from "./server/ai/schemas.ts";

export async function saveAvatarProfileDb(
  _input: AvatarProfile
): Promise<AvatarProfile | null> {
  return null;
}

export async function getAvatarProfileDb(
  _userId?: string | null
): Promise<AvatarProfile | null> {
  return null;
}

export async function saveSavedOutfitDb(
  _input: SavedOutfit
): Promise<SavedOutfit | null> {
  return null;
}

export async function listSavedOutfitsDb(
  _userId?: string | null
): Promise<SavedOutfit[] | null> {
  return null;
}
```

This keeps v1 usable in free testing mode while the SQL migration is designed separately.

- [ ] **Step 5: Verify tests pass**

Run:

```bash
npm test -- lib/server/wardrobe.test.ts lib/server/ai/schemas.test.ts
```

Expected: pass.

- [ ] **Step 6: Commit**

```bash
git add lib/server/wardrobe.ts lib/server/wardrobe.test.ts lib/supabase-db.ts
git commit -m "feat: add wardrobe avatar storage fallback"
```

---

### Task 3: Avatar And Saved Outfit API Routes

**Files:**
- Create: `app/api/avatar/route.ts`
- Create: `app/api/outfits/saved/route.ts`
- Modify: `app/api/wardrobe/route.ts`

- [ ] **Step 1: Add avatar route**

Create `app/api/avatar/route.ts`:

```ts
import { NextResponse } from "next/server";
import {
  getAvatarProfile,
  saveAvatarProfile,
} from "@/lib/server/wardrobe";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  return NextResponse.json({ ok: true, avatar: getAvatarProfile(userId) });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const avatar = saveAvatarProfile({
      id: typeof body?.id === "string" ? body.id : undefined,
      userId: typeof body?.userId === "string" ? body.userId : null,
      photoUrl: typeof body?.photoUrl === "string" ? body.photoUrl : null,
      thumbnailUrl: typeof body?.thumbnailUrl === "string" ? body.thumbnailUrl : null,
      photoQuality: body?.photoQuality ?? "usable",
    });
    return NextResponse.json({ ok: true, avatar }, { status: 201 });
  } catch (error) {
    console.error("[avatar]", error);
    return NextResponse.json(
      { error: "We could not save this avatar yet. Try again." },
      { status: 400 }
    );
  }
}
```

- [ ] **Step 2: Add saved outfits route**

Create `app/api/outfits/saved/route.ts`:

```ts
import { NextResponse } from "next/server";
import {
  listSavedOutfits,
  saveSavedOutfit,
} from "@/lib/server/wardrobe";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  return NextResponse.json({ ok: true, outfits: listSavedOutfits(userId) });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const outfit = saveSavedOutfit({
      id: typeof body?.id === "string" ? body.id : undefined,
      userId: typeof body?.userId === "string" ? body.userId : null,
      title: body?.title ?? "saved outfit",
      occasion: body?.occasion ?? "everyday",
      itemIds: Array.isArray(body?.itemIds) ? body.itemIds : [],
      lockedItemIds: Array.isArray(body?.lockedItemIds) ? body.lockedItemIds : [],
      verdict: body?.verdict ?? "unclear",
      score: Number.isFinite(body?.score) ? body.score : 0,
      confidence: Number.isFinite(body?.confidence) ? body.confidence : 0,
      reason: body?.reason ?? "This outfit was saved for later review.",
      nextAction: body?.nextAction ?? "Open this outfit when you are planning what to wear.",
    });
    return NextResponse.json({ ok: true, outfit }, { status: 201 });
  } catch (error) {
    console.error("[outfits/saved]", error);
    return NextResponse.json(
      { error: "We could not save this outfit yet. Try again." },
      { status: 400 }
    );
  }
}
```

- [ ] **Step 3: Keep wardrobe errors friendly**

In `app/api/wardrobe/route.ts`, keep the existing behavior but ensure catch returns:

```ts
return NextResponse.json({ error: "Could not save wardrobe item." }, { status: 400 });
```

Do not expose caught error messages to the client.

- [ ] **Step 4: Build route handlers**

Run:

```bash
npm run build
```

Expected: build passes; new routes use Node runtime.

- [ ] **Step 5: Commit**

```bash
git add app/api/avatar/route.ts app/api/outfits/saved/route.ts app/api/wardrobe/route.ts
git commit -m "feat: add avatar and saved outfit routes"
```

---

### Task 4: Browser-Safe Wardrobe Client Helpers

**Files:**
- Create: `lib/wardrobe-client.ts`
- Create: `lib/wardrobe-client.test.ts`

- [ ] **Step 1: Add failing tests**

Create `lib/wardrobe-client.test.ts`:

```ts
import assert from "node:assert/strict";
import test from "node:test";
import {
  buildWardrobeDraft,
  validateAvatarPhoto,
  validateWardrobeImage,
} from "./wardrobe-client.ts";

function file(name: string, type: string, size: number): File {
  return new File([new Uint8Array(size)], name, { type });
}

test("validates avatar photos with friendly messages", () => {
  assert.equal(validateAvatarPhoto(file("avatar.gif", "image/gif", 1000)), "Use a JPG, PNG, or WebP photo.");
  assert.equal(validateAvatarPhoto(file("avatar.jpg", "image/jpeg", 11 * 1024 * 1024)), "Photo must be 10 MB or smaller.");
  assert.equal(validateAvatarPhoto(file("avatar.jpg", "image/jpeg", 1000)), null);
});

test("validates wardrobe item photos", () => {
  assert.equal(validateWardrobeImage(file("shirt.txt", "text/plain", 1000)), "Use a JPG, PNG, or WebP image.");
  assert.equal(validateWardrobeImage(file("shirt.webp", "image/webp", 1000)), null);
});

test("builds manual wardrobe draft", () => {
  const draft = buildWardrobeDraft({ name: "rust sweater", category: "top" });
  assert.equal(draft.name, "rust sweater");
  assert.equal(draft.colorTemperature, "unknown");
});
```

- [ ] **Step 2: Run failing tests**

Run:

```bash
npm test -- lib/wardrobe-client.test.ts
```

Expected: fails because helper does not exist.

- [ ] **Step 3: Implement helpers**

Add `lib/wardrobe-client.ts`:

```ts
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export type WardrobeDraft = {
  source: "manual" | "user_upload";
  name: string;
  category: string;
  colors: string[];
  colorTemperature: "warm" | "cool" | "neutral" | "mixed" | "unknown";
  seasonFit: string[];
  formality: string;
  notes?: string;
  imageUrl?: string | null;
};

function validateImage(file: File, noun: string): string | null {
  if (!ALLOWED_TYPES.has(file.type)) return `Use a JPG, PNG, or WebP ${noun}.`;
  if (file.size > MAX_IMAGE_BYTES) return `${noun[0].toUpperCase()}${noun.slice(1)} must be 10 MB or smaller.`;
  return null;
}

export function validateAvatarPhoto(file: File): string | null {
  return validateImage(file, "photo");
}

export function validateWardrobeImage(file: File): string | null {
  return validateImage(file, "image");
}

export function buildWardrobeDraft(input: {
  name: string;
  category: string;
  imageUrl?: string | null;
}): WardrobeDraft {
  return {
    source: input.imageUrl ? "user_upload" : "manual",
    name: input.name.trim(),
    category: input.category.trim(),
    colors: [],
    colorTemperature: "unknown",
    seasonFit: [],
    formality: "unknown",
    imageUrl: input.imageUrl ?? null,
  };
}
```

- [ ] **Step 4: Verify tests pass**

Run:

```bash
npm test -- lib/wardrobe-client.test.ts
```

Expected: pass.

- [ ] **Step 5: Commit**

```bash
git add lib/wardrobe-client.ts lib/wardrobe-client.test.ts
git commit -m "feat: add wardrobe client helpers"
```

---

### Task 5: Wardrobe UI Components

**Files:**
- Create: `components/wardrobe/avatar-photo-step.tsx`
- Create: `components/wardrobe/wardrobe-item-card.tsx`
- Create: `components/wardrobe/real-photo-avatar-preview.tsx`
- Create: `components/wardrobe/outfit-verdict-card.tsx`
- Create: `components/wardrobe/wardrobe-onboarding.tsx`
- Create: `app/wardrobe/wardrobe.css`

- [ ] **Step 1: Add avatar photo step**

Create `components/wardrobe/avatar-photo-step.tsx`:

```tsx
"use client";

import { useState } from "react";
import { validateAvatarPhoto } from "@/lib/wardrobe-client";

export function AvatarPhotoStep({
  onPhoto,
  onSkip,
}: {
  onPhoto: (url: string) => void;
  onSkip: () => void;
}) {
  const [error, setError] = useState("");

  function handleFile(file: File | null) {
    if (!file) return;
    const validation = validateAvatarPhoto(file);
    if (validation) {
      setError(validation);
      return;
    }
    setError("");
    onPhoto(URL.createObjectURL(file));
  }

  return (
    <section className="wardrobe-card">
      <p className="pm-card-label">avatar photo</p>
      <h1>add a full-body photo</h1>
      <p>Stand facing the camera in good light. This becomes your outfit planning anchor.</p>
      <p className="wardrobe-privacy">Photos are processed securely for analysis. PaletteMe does not sell or share your images.</p>
      <label className="btn">
        upload photo
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(event) => handleFile(event.target.files?.[0] ?? null)}
          hidden
        />
      </label>
      <button className="wardrobe-link-button" type="button" onClick={onSkip}>skip for now</button>
      {error ? <p className="wardrobe-error">{error}</p> : null}
    </section>
  );
}
```

- [ ] **Step 2: Add preview and cards**

Create `components/wardrobe/real-photo-avatar-preview.tsx`:

```tsx
import type { WardrobeItem } from "@/lib/server/ai/schemas";

export function RealPhotoAvatarPreview({
  avatarUrl,
  items,
}: {
  avatarUrl?: string | null;
  items: WardrobeItem[];
}) {
  return (
    <section className="avatar-preview" aria-label="outfit preview">
      {avatarUrl ? (
        <div
          className="avatar-preview__photo"
          role="img"
          aria-label="Your outfit planning photo"
          style={{ backgroundImage: `url(${avatarUrl})` }}
        />
      ) : (
        <div className="avatar-preview__fallback">add avatar photo</div>
      )}
      <div className="avatar-preview__items">
        {items.map((item) => (
          <span key={item.id}>{item.name}</span>
        ))}
      </div>
      <p>This is an outfit preview, not exact try-on.</p>
    </section>
  );
}
```

Create `components/wardrobe/wardrobe-item-card.tsx`:

```tsx
import type { WardrobeItem } from "@/lib/server/ai/schemas";

export function WardrobeItemCard({
  item,
  selected,
  onToggle,
}: {
  item: WardrobeItem;
  selected: boolean;
  onToggle: (id: string) => void;
}) {
  return (
    <button
      type="button"
      className={selected ? "wardrobe-item is-selected" : "wardrobe-item"}
      onClick={() => onToggle(item.id)}
    >
      {item.imageUrl ? (
        <span
          className="wardrobe-item__photo"
          style={{ backgroundImage: `url(${item.imageUrl})` }}
        />
      ) : (
        <span className="wardrobe-item__swatch" />
      )}
      <strong>{item.name}</strong>
      <small>{item.category}</small>
    </button>
  );
}
```

Create `components/wardrobe/outfit-verdict-card.tsx`:

```tsx
export function OutfitVerdictCard({
  verdict,
  reason,
  nextAction,
}: {
  verdict: string;
  reason: string;
  nextAction: string;
}) {
  return (
    <section className="outfit-verdict">
      <strong>{verdict}</strong>
      <p>{reason}</p>
      <small>{nextAction}</small>
    </section>
  );
}
```

- [ ] **Step 3: Add onboarding container**

Create `components/wardrobe/wardrobe-onboarding.tsx`:

```tsx
"use client";

import { useMemo, useState } from "react";
import type { WardrobeItem } from "@/lib/server/ai/schemas";
import { AvatarPhotoStep } from "./avatar-photo-step";
import { OutfitVerdictCard } from "./outfit-verdict-card";
import { RealPhotoAvatarPreview } from "./real-photo-avatar-preview";
import { WardrobeItemCard } from "./wardrobe-item-card";

const SAMPLE_ITEMS: WardrobeItem[] = [
  {
    id: "sample-top",
    userId: null,
    source: "manual",
    name: "rust sweater",
    category: "top",
    colors: ["rust"],
    colorTemperature: "warm",
    seasonFit: ["autumn"],
    formality: "casual",
    correctedByUser: false,
  },
  {
    id: "sample-bottom",
    userId: null,
    source: "manual",
    name: "dark jeans",
    category: "bottom",
    colors: ["indigo"],
    colorTemperature: "cool",
    seasonFit: ["winter", "autumn"],
    formality: "casual",
    correctedByUser: false,
  },
];

export function WardrobeOnboarding() {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>(["sample-top", "sample-bottom"]);
  const selected = useMemo(
    () => SAMPLE_ITEMS.filter((item) => selectedIds.includes(item.id)),
    [selectedIds]
  );

  function toggle(id: string) {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((itemId) => itemId !== id) : [...current, id]
    );
  }

  return (
    <div className="wardrobe-layout">
      <AvatarPhotoStep onPhoto={setAvatarUrl} onSkip={() => setAvatarUrl(null)} />
      <RealPhotoAvatarPreview avatarUrl={avatarUrl} items={selected} />
      <section className="wardrobe-card">
        <p className="pm-card-label">10 favorite pieces first</p>
        <div className="wardrobe-grid">
          {SAMPLE_ITEMS.map((item) => (
            <WardrobeItemCard
              key={item.id}
              item={item}
              selected={selectedIds.includes(item.id)}
              onToggle={toggle}
            />
          ))}
        </div>
      </section>
      <OutfitVerdictCard
        verdict="balance it"
        reason="The pieces work together, but one warmer accessory would make it feel more intentional."
        nextAction="Add jewelry or swap shoes."
      />
    </div>
  );
}
```

- [ ] **Step 4: Add wardrobe CSS**

Create `app/wardrobe/wardrobe.css`:

```css
.wardrobe-layout {
  display: grid;
  grid-template-columns: minmax(260px, 0.9fr) minmax(280px, 1.1fr);
  gap: 14px;
}

.wardrobe-card,
.avatar-preview,
.outfit-verdict {
  border: 1px solid var(--hair);
  border-radius: 18px;
  background: #fffdfb;
  padding: 18px;
}

.wardrobe-card h1 {
  font-size: clamp(2rem, 6vw, 3.4rem);
  margin-bottom: 12px;
}

.wardrobe-privacy,
.wardrobe-card p {
  color: var(--ink-soft);
  font-size: 0.92rem;
}

.wardrobe-link-button {
  border: 0;
  background: transparent;
  color: var(--ink-soft);
  font: 700 0.9rem var(--sans);
  cursor: pointer;
}

.wardrobe-error {
  color: #9f1239;
}

.avatar-preview {
  min-height: 420px;
  display: grid;
  align-content: end;
  gap: 12px;
  background: color-mix(in srgb, var(--blush) 35%, #fff);
}

.avatar-preview__photo,
.avatar-preview__fallback {
  width: min(220px, 100%);
  aspect-ratio: 3 / 5;
  border-radius: 28px;
  justify-self: center;
  background: var(--cream-2);
  background-size: cover;
  background-position: center;
}

.avatar-preview__items {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.avatar-preview__items span {
  border-radius: 999px;
  background: #fff;
  padding: 6px 9px;
  font: 700 0.76rem var(--sans);
}

.wardrobe-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 10px;
}

.wardrobe-item {
  min-height: 136px;
  border: 1px solid var(--hair);
  border-radius: 16px;
  background: #fff;
  padding: 10px;
  text-align: left;
  cursor: pointer;
}

.wardrobe-item.is-selected {
  border-color: var(--pink);
}

.wardrobe-item__swatch,
.wardrobe-item__photo {
  display: block;
  width: 100%;
  aspect-ratio: 4 / 3;
  border-radius: 12px;
  background: var(--blush);
  background-size: cover;
  background-position: center;
  margin-bottom: 8px;
}

.wardrobe-item small {
  color: var(--ink-soft);
}

@media (max-width: 900px) {
  .wardrobe-layout {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 5: Lint**

Run:

```bash
npm run lint
```

Expected: no new lint errors.

- [ ] **Step 6: Commit**

```bash
git add components/wardrobe app/wardrobe/wardrobe.css
git commit -m "feat: add wardrobe avatar UI components"
```

---

### Task 6: Wardrobe And Outfit Routes

**Files:**
- Create: `app/wardrobe/page.tsx`
- Create: `app/outfits/page.tsx`
- Modify: `components/app/app-ui.tsx`
- Modify: `lib/app-nav.ts`

- [ ] **Step 1: Add wardrobe page**

Create `app/wardrobe/page.tsx`:

```tsx
import { AppShell } from "@/components/app/app-shell";
import { WardrobeOnboarding } from "@/components/wardrobe/wardrobe-onboarding";
import "@/app/home/home.css";
import "./wardrobe.css";

export const metadata = {
  title: "Wardrobe | PaletteMe",
  description: "Build outfits from clothes you already own.",
};

export default function WardrobePage() {
  return (
    <AppShell>
      <WardrobeOnboarding />
    </AppShell>
  );
}
```

- [ ] **Step 2: Add outfits page**

Create `app/outfits/page.tsx`:

```tsx
import Link from "next/link";
import { AppShell } from "@/components/app/app-shell";
import "@/app/home/home.css";
import "@/app/wardrobe/wardrobe.css";

export const metadata = {
  title: "Outfits | PaletteMe",
  description: "Plan outfit combinations from your saved wardrobe.",
};

export default function OutfitsPage() {
  return (
    <AppShell>
      <section className="wardrobe-card">
        <p className="pm-card-label">outfits</p>
        <h1>plan a look</h1>
        <p>Start with your wardrobe pieces, then save outfits for going out.</p>
        <Link className="btn" href="/wardrobe">open wardrobe</Link>
      </section>
    </AppShell>
  );
}
```

- [ ] **Step 3: Wire app navigation**

In `lib/app-nav.ts`, keep tab labels the same and update the scan destination if the wardrobe flow now owns outfit building:

```ts
{ id: "scan", label: "scan", href: "/home?scan=1" }
```

In `components/app/app-ui.tsx`, keep the wardrobe module pointing to:

```ts
{ label: "wardrobe", href: "/wardrobe" }
```

- [ ] **Step 4: Build**

Run:

```bash
npm run build
```

Expected: `/wardrobe` and `/outfits` build.

- [ ] **Step 5: Commit**

```bash
git add app/wardrobe/page.tsx app/outfits/page.tsx components/app/app-ui.tsx lib/app-nav.ts
git commit -m "feat: add wardrobe and outfit routes"
```

---

### Task 7: Docs And QA

**Files:**
- Modify: `docs/PRODUCT-SPEC.md`
- Modify: `LOGIC.md`

- [ ] **Step 1: Document v1 behavior**

In `docs/PRODUCT-SPEC.md`, under Wardrobe Matchmaker, add:

```md
V1 uses a real-photo anchored outfit planner:

- User can upload a full-body mirror photo as an avatar anchor.
- User starts with 5 to 10 favorite pieces.
- Preview is an outfit planner, not exact photoreal try-on.
- User corrections override AI labels.
```

In `LOGIC.md`, document:

```md
Wardrobe v1 uses `/api/wardrobe`, `/api/avatar`, and `/api/outfits/saved`.
Local fallback storage remains available for development. Supabase persistence can be expanded with a later SQL migration.
```

- [ ] **Step 2: Run full verification**

Run:

```bash
npm test
npm run lint
npm run build
```

Expected:

- Tests pass.
- Lint passes.
- Build passes.

- [ ] **Step 3: Browser QA**

Run:

```bash
npm run dev
```

Open:

```text
http://localhost:3000/wardrobe
http://localhost:3000/outfits
```

Check:

- User can upload a valid avatar photo and see a person-like preview.
- User can skip avatar and still see outfit board content.
- Item selection changes preview chips.
- Copy says outfit preview/planner, not exact try-on.
- Mobile layout keeps buttons above the bottom tabs.
- No raw technical errors appear.

- [ ] **Step 4: Commit**

```bash
git add docs/PRODUCT-SPEC.md LOGIC.md
git commit -m "docs: document wardrobe avatar v1"
```
