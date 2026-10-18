import { useState } from "react";
import { LeadCapture } from "../LeadCapture.tsx";

export interface TrackOption {
  audience: string;
  answer: string;
  label: string;
  trackSlug: string;
  /** Course page if the track is published, otherwise null (waitlist). */
  href: string | null;
}

/** One question that routes a free learner to the paid track that fits them. */
export function TrackQuiz({ options }: { options: TrackOption[] }) {
  const [pick, setPick] = useState<TrackOption | null>(null);

  return (
    <section className="cp cp--track" aria-labelledby="track-q">
      <p id="track-q" className="cp__label"><span className="cp__tag cp__tag--pro">Your next mission</span> What do you most want to build next?</p>
      <div className="track-grid">
        {options.map((o) => (
          <button key={o.audience} type="button" className={`track-pick ${pick?.audience === o.audience ? "is-on" : ""}`} aria-pressed={pick?.audience === o.audience} onClick={() => setPick(o)}>
            {o.answer}
          </button>
        ))}
      </div>
      {pick && (
        <div className="track-result" role="status">
          <p>Your track: <strong>{pick.label}</strong></p>
          {pick.href ? (
            <a className="btn btn--primary" href={pick.href}>See the course →</a>
          ) : (
            <LeadCapture source="track-quiz" track={pick.trackSlug} title="This track is launching soon." text="Get an email the day it opens — plus a launch discount." cta="Notify me" />
          )}
        </div>
      )}
    </section>
  );
}
