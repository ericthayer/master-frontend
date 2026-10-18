# Pilot Notes

Short, game-like courses for building with GitHub Copilot. Each course takes under 60 minutes. Built with Astro (static) and React islands; it deploys to Netlify.

Product decisions: [`docs/decisions.md`](docs/decisions.md).

## Run it

```bash
npm install
npm run dev        # http://localhost:4321
npm test           # unit tests + course content checks
npm run check      # type check (astro check)
npm run build      # static build → dist/
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

## Authoring a module

- Add an entry to the course's `modules` array.
- Each module must take 5–10 minutes. A course has at most 6 modules and must stay under 60 minutes; `npm test` enforces both rules.
- Checkpoint blocks (`quiz`, `fill`, `order`, `verify`) need an `id` that is unique within the course.
- A sandbox's `checks` must fail on the starter files. `npm test` checks this too.

## Deploy

1. Create a Netlify site from this repository.
2. Set the site's **base directory** to `pilot-notes`.

`netlify.toml` handles the rest: build command, publish directory and the `/free` redirect.

The email forms use Netlify Forms. The hidden `leads` form in `src/layouts/Base.astro` registers them, so there is no backend to set up.
