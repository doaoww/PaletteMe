import { NextResponse } from "next/server";
import {
  applyPersistedWardrobeCorrection,
  listPersistedWardrobeItems,
  savePersistedWardrobeItem,
  type WardrobeCorrection,
} from "@/server/services/wardrobe";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  return NextResponse.json({ ok: true, items: await listPersistedWardrobeItems(userId) });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (body?.action === "correct") {
      if (typeof body.id !== "string" || !body.id.trim()) {
        return NextResponse.json({ error: "Wardrobe item id is required." }, { status: 400 });
      }
      const item = await applyPersistedWardrobeCorrection(body.id, body.correction as WardrobeCorrection);
      if (!item) {
        return NextResponse.json({ error: "Wardrobe item not found." }, { status: 404 });
      }
      return NextResponse.json({ ok: true, item });
    }

    const item = await savePersistedWardrobeItem({
      id: typeof body?.id === "string" ? body.id : undefined,
      userId: typeof body?.userId === "string" ? body.userId : null,
      source: body?.source ?? "manual",
      name: body?.name,
      category: body?.category,
      colors: Array.isArray(body?.colors) ? body.colors : [],
      colorTemperature: body?.colorTemperature ?? "unknown",
      seasonFit: Array.isArray(body?.seasonFit) ? body.seasonFit : [],
      formality: body?.formality ?? "unknown",
      notes: typeof body?.notes === "string" ? body.notes : undefined,
      imageUrl: typeof body?.imageUrl === "string" ? body.imageUrl : null,
    });

    return NextResponse.json({ ok: true, item }, { status: 201 });
  } catch (error) {
    console.error("[wardrobe]", error);
    return NextResponse.json({ error: "Could not save wardrobe item." }, { status: 400 });
  }
}
