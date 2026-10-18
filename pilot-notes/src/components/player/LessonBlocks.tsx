import type { ReactNode } from "react";
import type { Block } from "../../content/types.ts";
import { Inline } from "../Inline.tsx";
import { Quiz } from "./checkpoints/Quiz.tsx";
import { FillBlank } from "./checkpoints/FillBlank.tsx";
import { OrderTask } from "./checkpoints/OrderTask.tsx";
import { TrackQuiz, type TrackOption } from "./checkpoints/TrackQuiz.tsx";

const CALLOUT: Record<string, string> = { tip: "Tip", warn: "Careful", pro: "Pro move" };

export interface BlockContext {
  isPassed: (id: string) => boolean;
  onPass: (id: string, firstTry: boolean) => void;
  trackOptions: TrackOption[];
  /** Rendered where a `sandbox-task` marker appears. */
  sandboxCue: ReactNode;
  /** Rendered for `verify` blocks (needs an account; provided by the player). */
  renderVerify: (id: string, prompt: string) => ReactNode;
}

export function LessonBlocks({ blocks, ctx }: { blocks: Block[]; ctx: BlockContext }) {
  return <>{blocks.map((b, i) => <BlockView key={i} block={b} ctx={ctx} />)}</>;
}

function BlockView({ block: b, ctx }: { block: Block; ctx: BlockContext }) {
  switch (b.t) {
    case "p":
      return <p><Inline text={b.text} /></p>;
    case "h":
      return <h2 className="lesson__h">{b.text}</h2>;
    case "list": {
      const items = b.items.map((it, i) => <li key={i}><Inline text={it} /></li>);
      return b.ordered ? <ol className="lesson__list">{items}</ol> : <ul className="lesson__list">{items}</ul>;
    }
    case "code":
      return (
        <figure className="code">
          {b.caption && <figcaption className="code__cap">{b.caption}</figcaption>}
          <pre tabIndex={0}><code data-lang={b.lang}>{b.code}</code></pre>
        </figure>
      );
    case "callout":
      return (
        <aside className={`callout callout--${b.tone}`} aria-label={CALLOUT[b.tone]}>
          <p className="callout__title">{b.title}</p>
          <p><Inline text={b.text} /></p>
        </aside>
      );
    case "steps":
      return (
        <ol className="steps">
          {b.items.map((s, i) => (
            <li key={i} className="steps__item">
              <p className="steps__title">{s.title}</p>
              <p><Inline text={s.text} /></p>
            </li>
          ))}
        </ol>
      );
    case "handoff":
      return (
        <aside className="handoff" aria-label={`Do this in ${b.tool}`}>
          <p className="handoff__tool">Switch to {b.tool}</p>
          <p className="handoff__title">{b.title}</p>
          <ol className="handoff__list">{b.items.map((it, i) => <li key={i}><Inline text={it} /></li>)}</ol>
        </aside>
      );
    case "quiz":
      return <Quiz {...b} passed={ctx.isPassed(b.id)} onPass={(ft) => ctx.onPass(b.id, ft)} />;
    case "fill":
      return <FillBlank {...b} passed={ctx.isPassed(b.id)} onPass={(ft) => ctx.onPass(b.id, ft)} />;
    case "order":
      return <OrderTask {...b} passed={ctx.isPassed(b.id)} onPass={(ft) => ctx.onPass(b.id, ft)} />;
    case "verify":
      return <>{ctx.renderVerify(b.id, b.prompt)}</>;
    case "sandbox-task":
      return <>{ctx.sandboxCue}</>;
    case "track-quiz":
      return <TrackQuiz options={ctx.trackOptions} />;
  }
}

