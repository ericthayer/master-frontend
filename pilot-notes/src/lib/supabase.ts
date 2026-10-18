import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env.PUBLIC_SUPABASE_URL;
const key = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

/** Browser client, or null when accounts aren't configured (free course still works). */
export const supabase: SupabaseClient | null =
  url && key && typeof window !== "undefined"
    ? createClient(url, key, { auth: { flowType: "pkce", persistSession: true, detectSessionInUrl: true } })
    : null;

export const accountsEnabled = Boolean(url && key);
