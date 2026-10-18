import { useState } from "react";
import { api } from "../../lib/account.ts";

/** Fetches a short-lived signed link for the course PDF and starts the download. */
export default function EbookButton({ course }: { course: string }) {
  const [state, setState] = useState<{ busy: boolean; error: string }>({ busy: false, error: "" });
  const go = async () => {
    setState({ busy: true, error: "" });
    const res = await api(`/api/ebook?course=${encodeURIComponent(course)}`);
    const body = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
    if (res.ok && body.url) { location.assign(body.url); setState({ busy: false, error: "" }); return; }
    setState({ busy: false, error: body.error ?? "Download unavailable right now." });
  };
  return (
    <>
      <button type="button" className="btn btn--sm" onClick={go} disabled={state.busy}>{state.busy ? "Preparing…" : "📘 E-book (PDF)"}</button>
      {state.error && <span className="buy__error" role="alert">{state.error}</span>}
    </>
  );
}
