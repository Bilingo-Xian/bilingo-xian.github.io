# 🎁 Bilingo Bonus Box

Internal site for Bilingo teachers: all GE bonus activities (games, videos, pictures)
organized by level → unit → lesson, with target vocabulary & structures on every lesson page.

## How it works

- `public/content/GE3/<lesson folder>/` — the activity files themselves.
  Folder names follow your convention: `GE3 U5C18 (is ... a ...?)` (level + `U<unit>C<cycle>` + topic).
- `scripts/build-data.py` — scans `public/content/` and reads the GE Master File, then regenerates:
  - `src/data/curriculum.json` — lesson codes, class titles, target vocab, target structures
  - `src/data/content.json` — which files belong to which lesson
- The React app reads those two JSONs, so **the site is fully data-driven**.

## Adding new materials

1. Drop the files into a folder named `GE<n> UxCy (topic)` under `public/content/GE<n>/`
   (create the level folder when migrating a new level).
2. Run `python3 scripts/build-data.py`.
3. Done — the site picks it up. No code changes needed.

## Commands

```bash
npm run dev      # local dev server
npm run build    # production build → dist/
npm run preview  # serve the production build locally
```

## Deploying to GitHub Pages (bilingo.github.io)

1. Create a GitHub org (or user) named `bilingo`, and a public repo named `bilingo.github.io`.
2. Push this project there (respecting `.gitignore` — `node_modules` and `dist` stay out).
3. Build & publish the static site:

```bash
npm run build
cd dist && git init && git add -A && git commit -m "site"
git push -f <your-repo-url> main:gh-pages
```

(Or use `npx gh-pages -d dist` — same result, less typing.)

Notes:

- Single files must stay under 100 MB (GitHub's hard cap) — current videos max out at 37 MB.
- The whole site should stay under ~1 GB; GE3 is ~130 MB.
- The site uses hash-based routing (`/#/level/GE3`), so no server-side config is needed.
