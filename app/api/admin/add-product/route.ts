import { NextResponse } from "next/server";
import { insertProduct, isSupabaseConfigured } from "@/lib/supabase-db";

export const runtime = "nodejs";

// POST /api/admin/add-product
// Inserts one product manually. Body: JSON matching the products table shape.
// Protect this route with a simple secret header in production.

export async function POST(request: Request) {
  const adminSecret = process.env.ADMIN_SECRET;
  if (adminSecret) {
    const provided = request.headers.get("x-admin-secret");
    if (provided !== adminSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Supabase is not configured." },
      { status: 503 }
    );
  }

  try {
    const body = await request.json() as {
      name: string;
      image_url?: string;
      price?: number;
      affiliate_url: string;
      colortypes?: string[];
      category?: string;
      colors?: string[];
      styles?: string[];
      body_types?: string[];
      source_id?: string;
    };

    if (!body.name || !body.affiliate_url) {
      return NextResponse.json(
        { error: "name and affiliate_url are required." },
        { status: 400 }
      );
    }

    const id = await insertProduct({
      name: body.name,
      image_url: body.image_url ?? null,
      price: body.price ?? null,
      affiliate_url: body.affiliate_url,
      colortypes: body.colortypes ?? null,
      category: body.category ?? null,
      colors: body.colors ?? null,
      styles: body.styles ?? null,
      body_types: body.body_types ?? null,
      source: "manual",
      source_id: body.source_id ?? null,
      is_active: true,
    });

    if (!id) {
      return NextResponse.json(
        { error: "Failed to insert product. Check Supabase logs." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, id });
  } catch (error) {
    console.error("[add-product]", error);
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 }
    );
  }
}
