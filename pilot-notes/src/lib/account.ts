import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "./supabase.ts";
import type { Entitlement } from "./access.ts";
import { startProgressSync } from "./sync.ts";

export type AuthState = { status: "loading" } | { status: "signed-out" } | { status: "signed-in"; session: Session };

let current: AuthState = supabase ? { status: "loading" } : { status: "signed-out" };
const listeners = new Set<(s: AuthState) => void>();
let stopSync: (() => void) | null = null;

function set(next: AuthState) {
  current = next;
  stopSync?.();
  stopSync = next.status === "signed-in" ? startProgressSync(next.session.user.id) : null;
  listeners.forEach((l) => l(next));
}

if (supabase) {
  void supabase.auth.getSession().then(({ data }) => set(data.session ? { status: "signed-in", session: data.session } : { status: "signed-out" }));
  supabase.auth.onAuthStateChange((_event, session) => {
    const prevId = current.status === "signed-in" ? current.session.user.id : null;
    const next: AuthState = session ? { status: "signed-in", session } : { status: "signed-out" };
    // Token refreshes keep the same user: update the session without restarting sync.
    if (session && prevId === session.user.id) { current = next; listeners.forEach((l) => l(next)); return; }
    set(next);
  });
}

export function useAuth(): AuthState {
  const [s, setS] = useState(current);
  useEffect(() => {
    listeners.add(setS);
    setS(current);
    return () => { listeners.delete(setS); };
  }, []);
  return s;
}

export async function accessToken(): Promise<string | null> {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

/** fetch() to our own /api with the user's token attached. */
export async function api(path: string, init: RequestInit = {}): Promise<Response> {
  const token = await accessToken();
  const headers = new Headers(init.headers);
  if (token) headers.set("Authorization", ["Bearer", token].join(" "));
  if (init.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  return fetch(path, { ...init, headers });
}

/** The signed-in user's entitlements (RLS limits rows to their own). */
export function useEntitlements(): { loading: boolean; rows: Entitlement[]; reload: () => void } {
  const auth = useAuth();
  const [state, setState] = useState<{ loading: boolean; rows: Entitlement[] }>({ loading: true, rows: [] });
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (auth.status === "loading") return;
    if (auth.status === "signed-out" || !supabase) { setState({ loading: false, rows: [] }); return; }
    let live = true;
    setState((s) => ({ ...s, loading: true }));
    void supabase.from("entitlements").select("course, source, expires_at").then(({ data }) => {
      if (live) setState({ loading: false, rows: (data ?? []) as Entitlement[] });
    });
    return () => { live = false; };
  }, [auth.status, auth.status === "signed-in" ? auth.session.user.id : null, tick]);
  return { ...state, reload: () => setTick((t) => t + 1) };
}

export async function signOut() {
  await supabase?.auth.signOut();
}
