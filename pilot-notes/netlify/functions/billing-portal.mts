import type { Config } from "@netlify/functions";
import { HttpError, handle, json, requireUser, siteUrl, stripe, supabaseAdmin } from "../lib/server.ts";

export default handle(async (req) => {
  const user = await requireUser(req);
  const { data } = await supabaseAdmin().from("stripe_customers").select("customer_id").eq("user_id", user.id).maybeSingle();
  if (!data?.customer_id) throw new HttpError(404, "No purchases yet.");
  const session = await stripe().billingPortal.sessions.create({ customer: data.customer_id as string, return_url: siteUrl(req, "/account") });
  return json({ url: session.url });
});

export const config: Config = { path: "/api/billing-portal", method: "POST" };
