import type { Config } from "@netlify/functions";
import type Stripe from "stripe";
import { getCourse } from "../../src/content/catalog.ts";
import { PASS } from "../../src/lib/access.ts";
import { env, json, stripe, supabaseAdmin } from "../lib/server.ts";

const ACTIVE: Stripe.Subscription.Status[] = ["active", "trialing", "past_due"];

async function grant(userId: string, course: string, source: "purchase" | "pass", expiresAt: string | null, ref: string) {
  const { error } = await supabaseAdmin()
    .from("entitlements")
    .upsert({ user_id: userId, course, source, expires_at: expiresAt, stripe_ref: ref }, { onConflict: "user_id,course,source" });
  if (error) throw new Error(error.message);
}

/** Always re-read the subscription so out-of-order events can't regress access. */
async function syncSubscription(id: string) {
  const sub = await stripe().subscriptions.retrieve(id);
  const userId = sub.metadata.user_id;
  if (!userId) return;
  const periodEnd = Math.max(0, ...sub.items.data.map((i) => i.current_period_end ?? 0));
  const active = ACTIVE.includes(sub.status) && periodEnd > 0;
  const expiresAt = active ? new Date(periodEnd * 1000).toISOString() : new Date().toISOString();
  await grant(userId, PASS, "pass", expiresAt, sub.id);
}

export default async (req: Request): Promise<Response> => {
  const signature = req.headers.get("stripe-signature");
  if (!signature) return json({ error: "Missing signature." }, 400);

  let event: Stripe.Event;
  try {
    event = await stripe().webhooks.constructEventAsync(await req.text(), signature, env("STRIPE_WEBHOOK_SECRET"));
  } catch {
    return json({ error: "Invalid signature." }, 400);
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded": {
        const s = event.data.object;
        const userId = s.metadata?.user_id;
        if (!userId) break;
        if (s.mode === "payment" && s.metadata?.plan === "course" && s.payment_status === "paid") {
          const course = s.metadata.course ?? "";
          if (getCourse(course)?.tier === "paid") await grant(userId, course, "purchase", null, s.id);
        }
        if (s.mode === "subscription" && typeof s.subscription === "string") await syncSubscription(s.subscription);
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        await syncSubscription(event.data.object.id);
        break;
      default:
        break;
    }
    await supabaseAdmin().from("stripe_events").upsert({ id: event.id, type: event.type }, { onConflict: "id" });
  } catch (e) {
    console.error("webhook failed", event.type, e);
    // 500 makes Stripe retry; grants are idempotent upserts.
    return json({ error: "Webhook handler failed." }, 500);
  }
  return json({ received: true });
};

export const config: Config = { path: "/api/stripe-webhook", method: "POST" };
