import { NextResponse } from "next/server";
import { sendTelegramMessage } from "@/lib/telegram";
import { addToWaitlist } from "@/lib/waitlist-store";
import { addToWaitlistDb, isSupabaseConfigured } from "@/lib/supabase-db";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = typeof body.email === "string" ? body.email.trim() : "";

    if (!email || !EMAIL_RE.test(email)) {
      return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
    }

    let isNew = true;

    // Supabase is the durable store — filesystem store is a dev-only fallback.
    // The filesystem (lib/waitlist-store.ts) is read-only on Vercel in production.
    if (isSupabaseConfigured()) {
      const result = await addToWaitlistDb(email, "waitlist");
      if (result === null) {
        // Supabase insert failed — treat as new so Telegram still fires
        isNew = true;
      } else {
        isNew = result.isNew;
      }
    } else {
      // Dev fallback: filesystem (works locally, not on Vercel)
      const result = await addToWaitlist(email, "waitlist");
      isNew = result.isNew;
    }

    if (isNew) {
      const message = [
        "🎨 <b>PaletteMe — new waitlist signup</b>",
        "",
        `📧 <code>${email.toLowerCase()}</code>`,
        `🕐 ${new Date().toLocaleString("en-GB", { timeZone: "UTC" })} UTC`,
        "",
        "Reply manually when you're ready to email them.",
      ].join("\n");

      // Fire-and-forget — Telegram failure should never break the signup response
      sendTelegramMessage(message).catch(() => {});
    }

    return NextResponse.json({
      ok: true,
      isNew,
      message: isNew
        ? "You're on the list — we'll be in touch."
        : "You're already on the list.",
    });
  } catch (error) {
    console.error("[waitlist] POST error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
