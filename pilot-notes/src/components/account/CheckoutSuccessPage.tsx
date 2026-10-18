import CheckoutSuccess from "./CheckoutSuccess.tsx";

/** Reads ?course= / ?plan= from the URL (static page) and validates them against the catalog. */
export default function CheckoutSuccessPage({ firstModules }: { firstModules: Record<string, string> }) {
  const q = new URLSearchParams(location.search);
  const raw = q.get("course");
  const course = raw && raw in firstModules ? raw : null;
  const plan = q.get("plan") === "pass" ? "pass" : "course";
  return <CheckoutSuccess course={course} plan={plan} firstModule={course ? firstModules[course]! : null} />;
}
