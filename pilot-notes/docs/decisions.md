# Phase 0 — Product decisions

These are the working decisions the build is based on. Anything marked **OPEN** needs an owner sign-off before launch; the code reads every one of them from `src/config/product.ts`, so changing a decision is a one-file edit.

## 1. Name

| Decision | Value |
|---|---|
| Working name | **Pilot Notes** |
| Tagline | The cheat sheet for building with AI. |
| Slug | `pilotnotes` |
| Status | **OPEN** — run a trademark search and buy the domain before launch. |

Brand rules:

- Never use "Copilot" or "CliffsNotes" in the product name, logo or domain.
- Describe the content as "for GitHub Copilot". The footer carries a non-affiliation notice.

## 2. Pricing and what "lifetime" means

| Plan | Price | What the buyer gets |
|---|---|---|
| Free | $0 | The beginner course. No account needed; progress is saved in the browser. |
| Single course | $5 one-time | **Lifetime** access to that course plus its e-book. |
| All-Access Pass | $24 / year | Every course and e-book, including new releases, **while the pass is active**. E-books downloaded during the pass stay the buyer's to keep. |
| Upgrade | $19 | A single-course buyer can upgrade to the pass, with the $5 already paid credited (Stripe coupon). |

Refunds: no questions asked within 30 days.

## 3. Copilot feature facts that need checking (OPEN)

Course copy must not hard-code facts that change often. Every item below lives in `src/content/reference.ts`, which carries a `verifiedOn` date and is shown in the player as **"Verified on …"**. Re-check all of it before launch and every quarter after that.

- [ ] The product name and install flow for the desktop experience
- [ ] Which models are available and which plans include them
- [ ] How agent skills and plug-ins are installed and listed
- [ ] The GitHub sign-in and repo connection steps
- [ ] The Netlify "Import from Git" flow and the default build settings

## 4. Where the work happens: the browser sandbox vs. the learner's own tools

- The **in-browser sandbox** is for practice and previews: HTML, CSS, JS and React through Sandpack.
- The **real project** is built in the learner's own Copilot, GitHub and Netlify accounts. Course lessons hand off to those tools.
- The final "Live on Netlify" badge is awarded by a **verify checkpoint**: the learner pastes their `https://*.netlify.app` URL and the server checks that it responds.

## 5. Scope cuts (agreed)

These are left out of the launch build:

- Babylon.js
- Daily streaks — replaced by in-course combo streaks
- Leaderboards
- Monaco and a custom IDE
- WebContainers
- Deploying from inside the sandbox
- EPUB output
- Watermarked PDFs
- The 3D hero on mobile and with reduced motion — a static poster is shown instead
- Fake testimonials — the section stays hidden until real quotes exist

## 6. Build-time choices made during implementation

- **Course content is typed TypeScript, not MDX.** One source feeds the player, the paid-lesson API and the e-book, and the compiler catches broken checkpoints.
- **Paid lesson bodies never ship in static HTML.** Only free modules and each course's preview module are pre-rendered. Everything else is served by `/api/lesson` to entitled users.
- **Only the Stripe webhook grants access.** The checkout success page just waits for the entitlement to appear.
- **3D hero = `three` + `@react-three/fiber` only.** `drei` and `motion` were cut: the scene needs no helpers, and scroll reveals use CSS scroll-driven animations, which degrade to static content. The scene loads lazily only on screens ≥768px that allow motion and support WebGL, and it pauses when scrolled off-screen or when the tab is hidden. Everyone else gets the CSS gradient backdrop.
- **Leads go to Netlify Forms**, not a database table. Export them to the email tool at launch.
- **E-books: Chromium print, no Paged.js.** Current Chromium supports `@page` margin boxes (page numbers, running headers) and PDF outlines and tags. That lets `page.pdf()` print the A5 layout directly. Paged.js would only add page numbers to the table of contents, which isn't worth a dependency. The interactive "web e-book" is the course player itself, so the copy now promises a PDF e-book only.
