import BuyButton from "../account/BuyButton.tsx";
import { pricing } from "../../config/product.ts";
import type { CourseOutline } from "../../content/types.ts";

/** In-flow paywall shown in place of a locked module body. */
export function UpgradeGate({ outline, signedIn }: { outline: CourseOutline; signedIn: boolean }) {
  return (
    <section className="gate" aria-labelledby="gate-h">
      <p className="gate__lock" aria-hidden="true">🔒</p>
      <h2 id="gate-h" className="gate__h">Unlock the rest of {outline.title}</h2>
      <p className="gate__text">You’ll build <strong>{outline.project.toLowerCase()}</strong> and put it live on the internet — in about {outline.minutes} minutes total.</p>
      <div className="gate__plans">
        <div className="gate__plan">
          <p className="gate__price">{pricing.course.label}</p>
          <p className="gate__note">{pricing.course.note}</p>
          <BuyButton plan="course" course={outline.slug} label={`Buy this course · ${pricing.course.label}`} ownedHref={`/learn/${outline.slug}/${outline.modules[0]!.id}`} />
        </div>
        <div className="gate__plan gate__plan--best">
          <p className="gate__price">{pricing.pass.label}<span>/yr</span></p>
          <p className="gate__note">{pricing.pass.note}</p>
          <BuyButton plan="pass" label="Get the All-Access Pass" primary={false} />
        </div>
      </div>
      {!signedIn && <p className="gate__fine">Already bought it? <a href={`/login?next=${encodeURIComponent(typeof location === "undefined" ? "/" : location.pathname)}`}>Sign in</a>.</p>}
    </section>
  );
}
