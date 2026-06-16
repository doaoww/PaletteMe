import { NextResponse } from "next/server";
import { sendTelegramMessage } from "@/lib/telegram";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const feature = typeof body.feature === "string" ? body.feature.trim() : "";

    if (!email || !EMAIL_RE.test(email)) {
      return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
    }

    const message = [
      "🎨 <b>PaletteMe — new waitlist signup</b>",
      "",
      `📧 <code>${email}</code>`,
      feature ? `✨ <code>${feature}</code>` : null,
      `🕐 ${new Date().toLocaleString("en-GB", { timeZone: "UTC" })} UTC`,
    ].filter(Boolean).join("\n");

    const sent = await sendTelegramMessage(message);
    console.log("[waitlist] Telegram sent:", sent, "for", email);

    // Best-effort DB save — never blocks the response
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      import("@/lib/supabase-db").then(({ addToWaitlistDb }) => {
        addToWaitlistDb(email, "waitlist").catch((e) =>
          console.error("[waitlist] db save failed:", e)
        );
      });
    }

    return NextResponse.json({
      ok: true,
      message: "You're on the list — we'll be in touch.",
    });
  } catch (error) {
    console.error("[waitlist] POST error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
