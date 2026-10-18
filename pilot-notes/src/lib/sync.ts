import { supabase } from "./supabase.ts";
import { progressStore } from "./progress-store.ts";
import { merge, parse } from "./progress.ts";

/**
 * Merge browser progress into the account on sign-in, then push local changes
 * (debounced). Returns a stop function.
 */
export function startProgressSync(userId: string): () => void {
  if (!supabase) return () => {};
  const db = supabase;
  let stopped = false;
  let timer = 0;
  let ready = false;

  const push = () => {
    window.clearTimeout(timer);
    timer = window.setTimeout(() => {
      void db.from("progress").upsert({ user_id: userId, data: progressStore.get(), updated_at: new Date().toISOString() });
    }, 800);
  };

  void db.from("progress").select("data").eq("user_id", userId).maybeSingle().then(({ data, error }) => {
    if (stopped || error) return;
    const merged = merge(progressStore.get(), parse(data?.data));
    ready = true;
    progressStore.set(merged);
    push();
  });

  const unsubscribe = progressStore.subscribe(() => { if (ready) push(); });
  return () => { stopped = true; window.clearTimeout(timer); unsubscribe(); };
}
