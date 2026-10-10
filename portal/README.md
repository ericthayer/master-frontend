# Frontend Academy

Learning portal that teaches product designers Git & GitHub, HTML & CSS, Markdown, CI/CD, DevTools and Vite.

- **Stack:** vanilla Web Components + native ES modules, no build step. JSDoc types checked by `tsc -p jsconfig.json` (strict).
- **Run locally:** `python3 -m http.server` in this folder, then open `index.html` (it relies on the host for `<!doctype html>`; add one for standalone hosting).
- **Content:** each module is one data file in `src/data/`. Lessons are arrays of typed blocks (see `src/types.d.ts`); add a lesson by appending to `lessons`.
- **Styles:** `styles/tokens.css` holds every color, type step and spacing token (dark-first, light overrides). Layout uses `@container main` with `@supports` fallbacks.
- **Progress:** stored per browser in localStorage under `fd-academy:v1`.
