import type { Audience, Course, CourseOutline } from "./types.ts";
import { freeCourse } from "./courses/copilot-in-30.ts";

/** Every published course. Order = library order. */
export const courses: Course[] = [freeCourse];

export const audiences: Record<Audience, { label: string; pitch: string; trackSlug: string }> = {
  beginner: { label: "Total beginners", pitch: "Never used AI to build anything? Start here, free.", trackSlug: "copilot-in-30" },
  "small-business": { label: "Small business owners", pitch: "Automate the busywork and build simple tools without hiring.", trackSlug: "copilot-for-small-business" },
  "product-design": { label: "Product owners & designers", pitch: "Prototype in an afternoon and hand developers something real.", trackSlug: "copilot-for-product-teams" },
  freelancer: { label: "Freelancers & consultants", pitch: "Build client deliverables faster and sell AI-built sites as a service.", trackSlug: "copilot-for-freelancers" },
};

/** Strip module bodies so the result is safe to send to any browser. */
export function toOutline(course: Course): CourseOutline {
  const { modules, ...rest } = course;
  return {
    ...rest,
    minutes: modules.reduce((sum, m) => sum + m.minutes, 0),
    modules: modules.map(({ id, title, minutes, objectives, badge }) => ({ id, title, minutes, objectives, ...(badge ? { badge } : {}) })),
  };
}

export function getCourse(slug: string): Course | undefined {
  return courses.find((c) => c.slug === slug);
}

export const outlines: CourseOutline[] = courses.map(toOutline);

const TRACK_ANSWERS: Array<{ audience: Exclude<Audience, "beginner">; answer: string }> = [
  { audience: "small-business", answer: "🧾 Tools that save my business time and money" },
  { audience: "product-design", answer: "🎨 Prototypes I can show my team and developers" },
  { audience: "freelancer", answer: "💼 Deliverables I can sell to clients" },
];

/** Options for the free course's track quiz. Unpublished tracks fall back to the waitlist. */
export function trackOptions() {
  return TRACK_ANSWERS.map(({ audience, answer }) => {
    const a = audiences[audience];
    const published = courses.some((c) => c.slug === a.trackSlug);
    return { audience, answer, label: a.label, trackSlug: a.trackSlug, href: published ? `/courses/${a.trackSlug}` : null };
  });
}
