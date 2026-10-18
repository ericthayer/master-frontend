#!/usr/bin/env node
/**
 * Course content → PDF e-books.
 *   1. `astro build` with EBOOK_BUILD=1 renders /ebook/<course>/ into .ebook-build/ (never deployed).
 *   2. A tiny static server + headless Chromium prints each page to ebooks/<course>.pdf.
 *   3. If SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY are set, PDFs are uploaded to the private
 *      `ebooks` bucket, where /api/ebook hands out short-lived signed links to buyers.
 * Usage: node scripts/build-ebooks.mjs [course-slug ...]
 */
import { execFileSync } from "node:child_process";
import { createServer } from "node:http";
import { mkdir, readdir, readFile, stat } from "node:fs/promises";
import { extname, join, normalize, resolve } from "node:path";
import { chromium } from "playwright";

const root = resolve(import.meta.dirname, "..");
const out = join(root, ".ebook-build");
const pdfDir = join(root, "ebooks");

execFileSync("npx", ["astro", "build"], { cwd: root, stdio: "inherit", env: { ...process.env, EBOOK_BUILD: "1" } });

const all = (await readdir(join(out, "ebook"))).filter((d) => !d.startsWith("."));
const only = process.argv.slice(2);
const slugs = only.length ? all.filter((s) => only.includes(s)) : all;
if (!slugs.length) throw new Error(`No e-books to build (found: ${all.join(", ") || "none"}).`);

const types = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".svg": "image/svg+xml", ".woff2": "font/woff2" };
const server = createServer(async (req, res) => {
  try {
    let path = normalize(decodeURIComponent(new URL(req.url ?? "/", "http://x").pathname));
    let file = join(out, path);
    if (!file.startsWith(out)) throw new Error("outside");
    if ((await stat(file)).isDirectory()) file = join(file, "index.html");
    res.writeHead(200, { "content-type": types[extname(file)] ?? "application/octet-stream" });
    res.end(await readFile(file));
  } catch {
    res.writeHead(404).end();
  }
});
await new Promise((ok) => server.listen(0, "127.0.0.1", ok));
const { port } = /** @type {import("node:net").AddressInfo} */ (server.address());

await mkdir(pdfDir, { recursive: true });
const browser = await chromium.launch();
try {
  for (const slug of slugs) {
    const page = await browser.newPage();
    await page.goto(`http://127.0.0.1:${port}/ebook/${slug}/`, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    const file = join(pdfDir, `${slug}.pdf`);
    await page.pdf({ path: file, preferCSSPageSize: true, printBackground: true, outline: true, tagged: true });
    await page.close();
    console.log(`✓ ${file}`);
  }
} finally {
  await browser.close();
  server.close();
}

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
  const { createClient } = await import("@supabase/supabase-js");
  const db = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
  for (const slug of slugs) {
    const { error } = await db.storage.from("ebooks").upload(`${slug}.pdf`, await readFile(join(pdfDir, `${slug}.pdf`)), { contentType: "application/pdf", upsert: true });
    if (error) throw error;
    console.log(`↑ uploaded ${slug}.pdf`);
  }
} else {
  console.log("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not set — skipped upload.");
}
