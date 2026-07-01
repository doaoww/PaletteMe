import { NextResponse } from "next/server";
import { createClient } from "@/lib/db/supabase-server";
import {
  getUserByAuthId,
  isSupabaseConfigured,
  linkAnonymousUser,
} from "@/lib/db/supabase-db";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "not_authenticated" }, { status: 401 });
  }

  const body = (await request.json()) as { anonymous_id?: string | null };
  const anonymousId =
    typeof body.anonymous_id === "string" && body.anonymous_id.trim()
      ? body.anonymous_id.trim()
      : null;

  try {
    if (anonymousId) {
      await linkAnonymousUser(anonymousId, user.id, user.email ?? "");
      return NextResponse.json({ ok: true, mode: "linked" });
    }

    const userData = await getUserByAuthId(user.id);
    if (!userData) {
      return NextResponse.json({ ok: true, mode: "not_found" });
    }

    return NextResponse.json({
      ok: true,
      mode: "restored",
      user_id: userData.id,
      colortype: userData.colortype,
      best_colors: userData.best_colors ?? [],
      avoid_colors: userData.avoid_colors ?? [],
      quiz_answers: userData.quiz_answers,
    });
  } catch (error) {
    console.error("/api/auth/link failed", error);
    return NextResponse.json({ error: "profile_link_failed" }, { status: 500 });
  }
}
