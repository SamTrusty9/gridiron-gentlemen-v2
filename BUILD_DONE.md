# BUILD DONE — Gridiron Gentlemen's Society site rebuild
Completed: 2026-10-06 ~22:04 MDT

## What was built
Brand-new static league website at `~/workspace/gridiron-gentlemen-v2/` (repo root,
directly deployable to GitHub Pages). Replaces the old 5.8MB single-file site.
Vanilla JS, no CDN dependencies, mobile-first responsive, PWA-installable.

## Site structure
- `index.html` — app shell (header, nav, footer, PWA tags)
- `css/styles.css` — dark "stadium night" theme (navy #0a1420, field-green #2ea36b, gold #d4a72c)
- `js/lib.js` — helpers (avatars, SVG charts, formatting) · `js/app.js` — hash router + data loader
- `js/sections/*.js` — 12 section modules (hash routes, shareable URLs)
- `data/*.json` — 16 per-section data files + `data/lineups/<id>.json` (12) + `data/manifest.json`
- `assets/` — 12 manager photos, league logo + badge, PWA icons (192/512, apple-touch-icon)
- `manifest.json`, `sw.js` — PWA (cache-first shell, network-first data)
- `tools/split_data.py` — repeatable splitter: regenerates all data files from `data/league-data.json`
- `DATA_CONTRACT.md` — data schema + component contract for future work

## Feature list (all ported from the old site)
Home (Week 5 matchups, 2026 standings, power rankings, trade-deadline chip) ·
Constitution & Rules · Results & Brackets (2023–2025, playoff brackets, awards) ·
Franchises (12 cards + detail pages: bio, year-by-year, H2H, lineup explorer) ·
Hall of Fame records · Draft History (all picks, 2023–2026) · 6 Rivalries ·
Divisions & power rankings · Player Search (527 players) · League Bets ·
Newsletter archive (6 editions) · Wall of Fame + Position Medals

## Data-file → section map
meta→shell/home · managers+franchises→franchise pages · divisions→divisions ·
standings→home/results · drafts→drafts · brackets→results · records→records ·
rivalries→rivalries · bets→bets · newsletters→newsletter · schedule→home ·
weekly→rivalries · rules→constitution · fame→fame · players→players ·
lineups/*→franchise lineup explorer

## Verification
- All 16 data files + shell assets serve HTTP 200
- `node --check` passes on all 15 JS files
- All 16 routes rendered in Node against real data: no undefined/NaN/[object Object] leaks

## Known gaps / notes
- Rivalry trophy/bet names don't exist in the source data (old site had empty defaults) — omitted gracefully
- Minor data inconsistency rendered as-is: HOF "most bench points" credits Sam Trusty (110.22) but bench table tops Jeffrey Taylor (118.40)
- Franchise lineup explorer uses an `<img onerror>` init hack (works; logs one harmless 404)
- `data/league-data.json` monolith kept as source of truth (read-only for the site)

## Remaining (for parent agent)
1. Create fresh GitHub repo + push (needs Sam's GitHub auth)
2. ESPN auto-update pipeline (league ID 1943216060, private — session-cookie based)
3. Tuesday newsletter draft-for-review cron
