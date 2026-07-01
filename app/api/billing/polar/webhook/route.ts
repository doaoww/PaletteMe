export const runtime = "nodejs";
export const maxDuration = 30;

import { validateEvent, WebhookVerificationError } from "@polar-sh/sdk/webhooks";
import { createServiceClient } from "@/lib/db/supabase-server";

// Polar calls this after a purchase. We only care about order.paid: it means
// money actually landed, and its metadata carries the user_id we stamped on
// the checkout in /api/billing/polar/checkout. This is the only place that
// writes report_entitlements -- /api/report/full only reads it.

export async function POST(request: Request) {
  const secret = process.env.POLAR_WEBHOOK_SECRET;
  if (!secret) {
    console.error("[/api/billing/polar/webhook] POLAR_WEBHOOK_SECRET is not configured");
    return new Response("Not configured", { status: 500 });
  }

  const body = await request.text();
  const headers: Record<string, string> = {};
  request.headers.forEach((value, key) => { headers[key] = value; });

  let event;
  try {
    event = validateEvent(body, headers, secret);
  } catch (err) {
    if (err instanceof WebhookVerificationError) {
      console.warn("[/api/billing/polar/webhook] signature verification failed:", err.message);
      return new Response("Invalid signature", { status: 403 });
    }
    throw err;
  }

  if (event.type === "order.paid") {
    const userId = event.data.metadata?.user_id;
    if (typeof userId !== "string" || !userId) {
      console.error("[/api/billing/polar/webhook] order.paid with no user_id in metadata, order:", event.data.id);
      return new Response("", { status: 202 });
    }

    const supabase = await createServiceClient();
    const { error } = await supabase
      .from("report_entitlements")
      .upsert({ user_id: userId, polar_order_id: event.data.id, purchased_at: new Date().toISOString() });

    if (error) {
      console.error("[/api/billing/polar/webhook] failed to write entitlement:", error.message);
      return new Response("Failed to record entitlement", { status: 500 });
    }
  }

  return new Response("", { status: 202 });
}
