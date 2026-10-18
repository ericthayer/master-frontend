import { useState, type SubmitEvent } from "react";
import { submitLead } from "../../lib/leads.ts";

interface Props {
  source: string;
  track?: string;
  title: string;
  text: string;
  cta?: string;
}

/** Optional email capture. Never blocks learning. */
export function LeadCapture({ source, track, title, text, cta = "Send it" }: Props) {
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const onSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    if (data.get("bot-field")) return;
    setStatus("sending");
    const ok = await submitLead({ email: String(data.get("email") ?? ""), track, source });
    setStatus(ok ? "done" : "error");
  };

  if (status === "done") return <p className="lead lead--done" role="status">✅ You’re on the list. Check your inbox.</p>;

  return (
    <form className="lead" onSubmit={onSubmit}>
      <p className="lead__title">{title}</p>
      <p className="lead__text">{text}</p>
      <div className="lead__row">
        <label className="visually-hidden" htmlFor={`lead-${source}`}>Email address</label>
        <input id={`lead-${source}`} className="field" type="email" name="email" required autoComplete="email" placeholder="you@example.com" />
        <input type="text" name="bot-field" tabIndex={-1} autoComplete="off" hidden />
        <button className="btn btn--primary" type="submit" disabled={status === "sending"}>{status === "sending" ? "Sending…" : cta}</button>
      </div>
      {status === "error" && <p className="lead__error" role="alert">That didn’t go through. Please try again.</p>}
    </form>
  );
}
