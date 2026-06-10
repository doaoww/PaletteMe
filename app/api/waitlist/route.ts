import { NextResponse } from "next/server";
import { sendTelegramMessage } from "@/lib/telegram";
import { addToWaitlist } from "@/lib/waitlist-store";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = typeof body.email === "string" ? body.email.trim() : "";

    if (!email || !EMAIL_RE.test(email)) {
      return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
    }

    const { entry, isNew } = await addToWaitlist(email, "waitlist");

    if (isNew) {
      const message = [
        "🎨 <b>PaletteMe — new waitlist signup</b>",
        "",
        `📧 <code>${entry.email}</code>`,
        `🕐 ${new Date(entry.createdAt).toLocaleString("en-GB", { timeZone: "UTC" })} UTC`,
        "",
        "Reply manually when you're ready to email them.",
      ].join("\n");

      await sendTelegramMessage(message);
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
