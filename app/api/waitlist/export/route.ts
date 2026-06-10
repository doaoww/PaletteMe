import { NextResponse } from "next/server";
import { readWaitlist } from "@/lib/waitlist-store";

/** GET /api/waitlist/export?key=YOUR_ADMIN_SECRET — download emails as CSV */
export async function GET(request: Request) {
  const secret = process.env.WAITLIST_ADMIN_SECRET;
  const key = new URL(request.url).searchParams.get("key");

  if (!secret || key !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const entries = await readWaitlist();
  const header = "email,created_at,source";
  const rows = entries.map(
    (e) => `${e.email},${e.createdAt},${e.source}`
  );
  const csv = [header, ...rows].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="paletteme-waitlist.csv"',
    },
  });
}
