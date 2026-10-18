import { Fragment, type ReactNode } from "react";

const TOKEN = /\*\*([^*]+)\*\*|`([^`]+)`|\[([^\]]+)\]\(([^)\s]+)\)/g;

/** Allow only web links and site-relative paths in authored content. */
export function safeHref(url: string): string | null {
  if (url.startsWith("/") && !url.startsWith("//")) return url;
  try {
    const u = new URL(url);
    return u.protocol === "https:" || u.protocol === "http:" || u.protocol === "mailto:" ? u.href : null;
  } catch {
    return null;
  }
}

/** Render the inline subset used in course text: **bold**, `code`, [link](url). */
export function Inline({ text }: { text: string }) {
  const out: ReactNode[] = [];
  let last = 0;
  let i = 0;
  for (const m of text.matchAll(TOKEN)) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const [, bold, code, label, url] = m;
    if (bold) out.push(<strong key={i++}>{bold}</strong>);
    else if (code) out.push(<code key={i++}>{code}</code>);
    else if (label && url) {
      const href = safeHref(url);
      const external = href !== null && !href.startsWith("/");
      out.push(href ? <a key={i++} href={href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>{label}</a> : label);
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return <Fragment>{out}</Fragment>;
}
