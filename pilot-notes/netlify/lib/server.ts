import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";
import Stripe from "stripe";
import type { Entitlement } from "../../src/lib/access.ts";

/** Read a required env var or fail loudly at call time (not import time). */
export function env(name: string): string {
  const v = process.env[name];
  if (!v) throw new HttpError(500, `Server is missing ${name}`);
  return v;
}

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "private, no-store" },
  });
}

/** Wrap a handler so thrown HttpErrors become JSON responses and anything else is a 500. */
export function handle(fn: (req: Request) => Promise<Response>) {
  return async (req: Request): Promise<Response> => {
    try {
      return await fn(req);
    } catch (e) {
      if (e instanceof HttpError) return json({ error: e.message }, e.status);
      console.error(e);
      return json({ error: "Something went wrong." }, 500);
    }
  };
}

let admin: SupabaseClient | null = null;
/** Service-role client. Bypasses RLS — server only. */
export function supabaseAdmin(): SupabaseClient {
  return (admin ??= createClient(env("PUBLIC_SUPABASE_URL"), env("SUPABASE_SERVICE_ROLE_KEY"), {
    auth: { persistSession: false, autoRefreshToken: false },
  }));
}

let stripeClient: Stripe | null = null;
export function stripe(): Stripe {
  return (stripeClient ??= new Stripe(env("STRIPE_SECRET_KEY")));
}

/** Resolve the signed-in user from the Authorization header (Supabase access token). */
export async function requireUser(req: Request): Promise<User> {
  const header = req.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) throw new HttpError(401, "Sign in required.");
  const { data, error } = await supabaseAdmin().auth.getUser(token);
  if (error || !data.user) throw new HttpError(401, "Sign in required.");
  return data.user;
}

export async function entitlementsFor(userId: string): Promise<Entitlement[]> {
  const { data, error } = await supabaseAdmin().from("entitlements").select("course, source, expires_at").eq("user_id", userId);
  if (error) throw new Error(error.message);
  return (data ?? []) as Entitlement[];
}

/** Same-origin URL builder for redirects (Stripe success/cancel, portal return). */
export function siteUrl(req: Request, path: string): string {
  const base = process.env.URL ?? new URL(req.url).origin;
  return new URL(path, base).toString();
}

export async function readJson<T>(req: Request): Promise<T> {
  try {
    return (await req.json()) as T;
  } catch {
    throw new HttpError(400, "Invalid JSON body.");
  }
}
