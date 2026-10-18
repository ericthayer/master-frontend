import type { Config } from "@netlify/functions";
import { getCourse } from "../../src/content/catalog.ts";
import { hasAccess, hasActivePass } from "../../src/lib/access.ts";
import { HttpError, entitlementsFor, env, handle, json, readJson, requireUser, siteUrl, stripe, supabaseAdmin } from "../lib/server.ts";

interface Body { plan?: unknown; course?: unknown }

async function customerFor(userId: string, email: string | undefined): Promise<string> {
  const db = supabaseAdmin();
  const { data } = await db.from("stripe_customers").select("customer_id").eq("user_id", userId).maybeSingle();
  if (data?.customer_id) return data.customer_id as string;
  const customer = await stripe().customers.create({ ...(email ? { email } : {}), metadata: { user_id: userId } });
  const { error } = await db.from("stripe_customers").insert({ user_id: userId, customer_id: customer.id });
  if (error) {
    // Lost a race with a parallel request: use the stored one.
    const again = await db.from("stripe_customers").select("customer_id").eq("user_id", userId).single();
    if (again.data?.customer_id) return again.data.customer_id as string;
    throw new Error(error.message);
  }
  return customer.id;
}

export default handle(async (req) => {
  const user = await requireUser(req);
  const body = await readJson<Body>(req);
  const rows = await entitlementsFor(user.id);
  const customer = await customerFor(user.id, user.email);

  if (body.plan === "course") {
    const slug = typeof body.course === "string" ? body.course : "";
    const course = getCourse(slug);
    if (!course || course.tier !== "paid") throw new HttpError(400, "Unknown course.");
    if (hasAccess(rows, slug)) throw new HttpError(409, "You already have this course.");
    const session = await stripe().checkout.sessions.create({
      mode: "payment",
      customer,
      client_reference_id: user.id,
      line_items: [{ price: env("STRIPE_PRICE_COURSE"), quantity: 1 }],
      metadata: { user_id: user.id, plan: "course", course: slug },
      payment_intent_data: { description: `Pilot Notes — ${course.title}`, metadata: { user_id: user.id, course: slug } },
      success_url: siteUrl(req, `/checkout/success?course=${encodeURIComponent(slug)}&session_id={CHECKOUT_SESSION_ID}`),
      cancel_url: siteUrl(req, `/courses/${encodeURIComponent(slug)}`),
      allow_promotion_codes: true,
      automatic_tax: { enabled: process.env.STRIPE_AUTOMATIC_TAX === "true" },
    });
    return json({ url: session.url });
  }

  if (body.plan === "pass") {
    if (hasActivePass(rows)) throw new HttpError(409, "Your pass is already active.");
    // Single-course buyers upgrade for $19: the coupon credits the $5 they paid.
    const isUpgrade = rows.some((r) => r.source === "purchase");
    const coupon = process.env.STRIPE_COUPON_UPGRADE;
    const session = await stripe().checkout.sessions.create({
      mode: "subscription",
      customer,
      client_reference_id: user.id,
      line_items: [{ price: env("STRIPE_PRICE_PASS"), quantity: 1 }],
      metadata: { user_id: user.id, plan: "pass" },
      subscription_data: { metadata: { user_id: user.id, plan: "pass" } },
      ...(isUpgrade && coupon ? { discounts: [{ coupon }] } : { allow_promotion_codes: true }),
      success_url: siteUrl(req, "/checkout/success?plan=pass&session_id={CHECKOUT_SESSION_ID}"),
      cancel_url: siteUrl(req, "/pricing"),
      automatic_tax: { enabled: process.env.STRIPE_AUTOMATIC_TAX === "true" },
    });
    return json({ url: session.url });
  }

  throw new HttpError(400, "Unknown plan.");
});

export const config: Config = { path: "/api/checkout", method: "POST" };
