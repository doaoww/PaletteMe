export const runtime = "nodejs";
export const maxDuration = 30;

import { createClient } from "@/lib/db/supabase-server";
import { getPolarClient, getSiteUrl } from "@/lib/billing/polar";
import { checkRateLimit } from "@/lib/shared/rate-limit";

// Creates a Polar checkout session for the one-time "unlock full report"
// purchase. The user_id is stamped into checkout metadata, which Polar
// copies onto the resulting order -- that's how the webhook (which has no
// user session) knows whose report_entitlements row to write.

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: "Sign in required" }, { status: 401 });
  }

  const rate = await checkRateLimit(`polar-checkout:${user.id}`, 10, 60 * 60 * 1000);
  if (!rate.allowed) {
    return Response.json({ error: "Too many attempts. Please try again later." }, { status: 429 });
  }

  const productId = process.env.POLAR_REPORT_PRODUCT_ID;
  if (!productId) {
    console.error("[/api/billing/polar/checkout] POLAR_REPORT_PRODUCT_ID is not configured");
    return Response.json({ error: "Payments are not configured yet." }, { status: 500 });
  }

  try {
    const polar = getPolarClient();
    const checkout = await polar.checkouts.create({
      products: [productId],
      successUrl: `${getSiteUrl()}/style-setup?unlocked=1`,
      metadata: { user_id: user.id },
    });
    return Response.json({ url: checkout.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[/api/billing/polar/checkout] checkout creation failed:", message);
    return Response.json({ error: "Could not start checkout. Please try again." }, { status: 500 });
  }
}
