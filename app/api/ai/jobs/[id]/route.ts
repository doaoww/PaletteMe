import { NextResponse } from "next/server";
import { getPublicAiJob } from "@/lib/server/ai/jobs";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const job = getPublicAiJob(id);
  if (!job) {
    return NextResponse.json({ error: "Job not found." }, { status: 404 });
  }
  return NextResponse.json({ ok: true, job });
}
