# Pilot Notes

Short, game-like courses for building with GitHub Copilot. Each course takes under 60 minutes. Built with Astro (static) and React islands. Netlify Functions handle payments and paid lessons, and Supabase handles accounts. It deploys to Netlify.

Product decisions: [`docs/decisions.md`](docs/decisions.md).

## Run it

```bash
npm install
npm run dev        # http://localhost:4321
npm test           # unit tests + course content checks
npm run check      # type check (astro check)
npm run build      # static build → dist/
npm run ebooks     # course PDFs → ebooks/ (uploads to Supabase if its env vars are set)
```

## Layout

| Path | What it holds |
|---|---|
| `src/config/product.ts` | Name, prices and XP values — change them here |
| `src/content/types.ts` | The content model. Lessons are typed blocks. |
| `src/content/courses/*.ts` | One file per course. Register new courses in `src/content/catalog.ts`. |
| `src/content/reference.ts` | Copilot, GitHub and Netlify facts that change often. Re-check them before launch. |
| `src/components/player/` | The course player: sidebar, header, lesson blocks, checkpoints, Sandpack sandbox, celebrations |
| `src/lib/progress.ts` | The progress, XP and badge logic. These are pure functions, which keeps them unit-tested. |
| `src/lib/progress-store.ts` | Saves progress to localStorage and gives React a hook to read it |
| `src/lib/account.ts`, `sync.ts`, `access.ts` | Sign-in, entitlements, progress sync and access rules |
| `src/components/marketing/` | Home page sections, including the lazy Three.js hero |
| `netlify/functions/` | `/api/checkout`, `/api/stripe-webhook`, `/api/billing-portal`, `/api/lesson`, `/api/verify-url`, `/api/ebook` |
| `supabase/migrations/` | Database schema and row-level security |
| `src/pages/ebook/`, `scripts/build-ebooks.mjs` | E-book print template and the PDF pipeline. The template is only built when `EBOOK_BUILD=1`. |

## Authoring a module

- Add an entry to the course's `modules` array.
- Each module must take 5–10 minutes. A course has at most 6 modules and must stay under 60 minutes; `npm test` enforces both rules.
- Checkpoint blocks (`quiz`, `fill`, `order`, `verify`) need an `id` that is unique within the course.
- A sandbox's `checks` must fail on the starter files. `npm test` checks this too.

## Deploy

1. Create a Netlify site from this repository.
2. Set the site's **base directory** to `pilot-notes`.
3. Create a Supabase project and run `supabase/migrations/0001_init.sql`. Enable email (magic link) auth, and add `<site>/login` to the redirect URLs.
4. In Stripe:
   - Create a $5 one-time price and a $24 yearly price, plus a $5-off "once" coupon for upgrades.
   - Add a webhook to `<site>/api/stripe-webhook` for these events:
     - `checkout.session.completed`
     - `checkout.session.async_payment_succeeded`
     - `customer.subscription.created`, `customer.subscription.updated` and `customer.subscription.deleted`
5. Set the variables from `.env.example` in Netlify's environment settings.
6. Add the GitHub secrets `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`. With those set, the e-book workflow publishes PDFs whenever course content changes.

`netlify.toml` handles the rest: build command, publish directory, functions and the `/free` redirect. Until the Supabase variables are set, the site runs with accounts off: the free course and previews work, and the buy buttons say "Checkout opens at launch".

The email forms use Netlify Forms. The hidden `leads` form in `src/layouts/Base.astro` registers them, so there is no backend to set up.
