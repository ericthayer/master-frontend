// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";

export default defineConfig({
  site: process.env.URL ?? "https://pilotnotes.netlify.app",
  integrations: [react()],
  trailingSlash: "ignore",
  // E-book builds (scripts/build-ebooks.mjs) render paid content, so they never touch the deploy folder.
  outDir: process.env.EBOOK_BUILD === "1" ? ".ebook-build" : "dist",
});
