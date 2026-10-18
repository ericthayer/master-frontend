import { useState, type SubmitEvent } from "react";
import { api } from "../../../lib/account.ts";
import { parseNetlifyUrl } from "../../../lib/access.ts";
import { Inline } from "../../Inline.tsx";

interface Props {
  course: string;
  prompt: string;
  passed: boolean;
  savedUrl: string | undefined;
  onVerified: (url: string) => void;
}

/** "Ship it" checkpoint: the server confirms the learner's Netlify site responds. */
export function VerifyUrl({ course, prompt, passed, savedUrl, onVerified }: Props) {
  const [status, setStatus] = useState<"idle" | "checking" | "error">("idle");
  const [reason, setReason] = useState("");

  const onSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const raw = String(new FormData(e.currentTarget).get("url") ?? "");
    if (!parseNetlifyUrl(raw)) { setStatus("error"); setReason("Use your full Netlify address, like https://my-site.netlify.app"); return; }
    setStatus("checking");
    try {
      const res = await api("/api/verify-url", { method: "POST", body: JSON.stringify({ url: raw, course }) });
      const body = (await res.json()) as { ok?: boolean; url?: string; reason?: string; error?: string };
      if (body.ok && body.url) { setStatus("idle"); onVerified(body.url); return; }
      setStatus("error");
      setReason(body.reason ?? body.error ?? "We couldn’t reach that site.");
    } catch {
      setStatus("error");
      setReason("We couldn’t reach the checker. Try again in a moment.");
    }
  };

  if (passed) {
    return (
      <div className="cp cp--verify is-ok">
        <p className="cp__label"><span className="cp__tag">Shipped</span> 🚀 Your project is live</p>
        {savedUrl && <a href={savedUrl} target="_blank" rel="noopener noreferrer">{savedUrl}</a>}
      </div>
    );
  }

  return (
    <form className={`cp cp--verify ${status === "error" ? "is-bad" : ""}`} onSubmit={onSubmit}>
      <label className="cp__label" htmlFor={`verify-${course}`}><span className="cp__tag">Ship it</span> <Inline text={prompt} /></label>
      <div className="lead__row">
        <input id={`verify-${course}`} className="field" name="url" type="url" inputMode="url" required placeholder="https://my-project.netlify.app" autoComplete="url" />
        <button className="btn btn--primary" type="submit" disabled={status === "checking"}>{status === "checking" ? "Checking…" : "Verify live site"}</button>
      </div>
      <p className="cp__feedback" role="status">{status === "error" ? reason : ""}</p>
    </form>
  );
}
