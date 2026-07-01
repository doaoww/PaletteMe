import { NextResponse } from "next/server";
import { createClient } from "@/lib/db/supabase-server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const { productId, action, productData } = await request.json() as {
      productId: string;
      action: "click" | "save" | "dismiss";
      productData?: unknown;
    };

    if (!productId || !["click", "save", "dismiss"].includes(action)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    // Only persist if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      return NextResponse.json({ ok: true });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ ok: true }); // not signed in — noop
    }

    await supabase.from("user_interactions").insert({
      user_id: user.id,
      product_id: productId,
      product_data: productData ?? null,
      action,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true }); // always succeed — tracking is best-effort
  }
}
