/** Submit to the Netlify Form named "leads" (declared statically in Base.astro). */
export async function submitLead(fields: { email: string; track?: string; source: string }): Promise<boolean> {
  const body = new URLSearchParams({ "form-name": "leads", email: fields.email, track: fields.track ?? "", source: fields.source });
  try {
    const res = await fetch("/", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: body.toString() });
    return res.ok;
  } catch {
    return false;
  }
}
