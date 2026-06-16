import { NextResponse } from "next/server";

export const runtime = "nodejs";

export function GET(request: Request) {
  const url = new URL(request.url);
  url.pathname = "/api/auth/callback";
  return NextResponse.redirect(url);
}
