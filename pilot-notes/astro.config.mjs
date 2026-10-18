// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";

export default defineConfig({
  site: process.env.URL ?? "https://pilotnotes.netlify.app",
  integrations: [react()],
  trailingSlash: "ignore",
});
