# CLAUDE.md — Our May planner

## What this is
A private web app for a couple (nicknames **Boyet** and **Peachy**) to plan dates for **May 2027**, track a shared date budget, and record each person's savings contributions. All amounts are in **Philippine pesos (₱)**. Most dates are around **Tagaytay / Cavite**. The app is used **mostly on phones**, so every change must work well at about 390px width first, then on desktop.

Live site: https://tactile4312.github.io/may-plans/ (GitHub repo `Tactile4312/may-plans`, branch `main`).

## How to work with the owner (Boyet)
- **Ask clarifying questions before starting a task or building anything.** He has asked for this repeatedly; don't make him repeat it. Keep questions short and offer sensible default choices.
- He is **learning** modern web development (React/TypeScript beginner, comfortable with Git and VS Code). When you change code, briefly explain what you changed and why, in plain language. Prefer small, readable changes over clever ones.
- Don't add new libraries or services without asking. Anything that costs money (for example Firebase Blaze, which Storage needs) must be flagged before use; the project stays on the free Firebase **Spark** plan.
- No "made with Claude"/AI branding anywhere in the app.

## Stack
- **React 19 + TypeScript + Vite 6**, styled with **Tailwind CSS v4** (`@tailwindcss/vite`, configured in `src/index.css`, no tailwind.config file).
- **Recharts** for charts.
- **Firebase** (modular SDK v11): Authentication (email/password) + Firestore.
- Hosted on **GitHub Pages**, built and deployed by GitHub Actions (`.github/workflows/deploy.yml`) on every push to `main`. Pages source must be set to "GitHub Actions".
- PWA: `public/manifest.webmanifest`, `public/sw.js`, icons in `public/`.

## Commands
- `npm install` — install packages
- `npm run dev` — local dev server at http://localhost:5173/may-plans/ (uses the **real** shared Firestore data, so edits are live for both people)
- `npm run typecheck` — TypeScript check (`tsc --noEmit`)
- `npm run build` — production build to `dist/` (Vite only; it does not type-check, so run `typecheck` separately)
- `npm run preview` — serve the built `dist/`

## Project status / known gaps
- First setup done 2026-10-18 (Node 24 LTS, npm 11): `npm install`, `npm run typecheck` (clean, strict) and `npm run build` all pass, and all four charts render with real data.
- `npm audit` reports high-severity issues in `@grpc/grpc-js` (pulled in by Firebase). It is Node-only and not used in the browser bundle. **Never run `npm audit fix --force`**: it downgrades Firebase to v9 and breaks the app.
- The build warns that the JS bundle is over 500 kB (~320 kB gzipped, mostly Firebase + Recharts). Acceptable for now; code-splitting the charts is an optional later improvement.
- Recharts 2.x is deprecated upstream but works; moving to v3 would need code changes, so ask first.
- The GitHub repo's first commits are the old single-file HTML version (uploaded via the website). The React version replaces it, and Pages must be switched to "GitHub Actions" for the deploy workflow to publish it.
- `vite.config.ts` `base` must stay `"/may-plans/"` (matches the repo name).

## Code map
- `src/config.ts` — Firebase web config (public by design), the two logins (`logins[0]` = partner 1 = Boyet, `logins[1]` = partner 2 = Peachy), `YEAR`/`MONTH` (MONTH is 0-based, 4 = May), and `PLAN_DOC`.
- `src/lib/` — plain TS, no React: `types.ts` (data model), `defaults.ts` (original itinerary + starter places + `isPlanner`/`normalize`), `format.ts` (peso, dates, links, categories + colors), `totals.ts` (all dashboard math), `plan.ts` (helpers), `firebase.ts`, `storage.ts` (safe localStorage).
- `src/state/auth.tsx` — `useAuth()`: `user`, `me` (`"p1" | "p2"` from the signed-in email), `signIn`, `signOut`, `needsLogin`.
- `src/state/planner.tsx` — `usePlanner()`: `plan`, `sync` status, `update(draft => {...}, { toast, undo })`, `replace`, `name(key)`. `update` clones the plan, saves to localStorage, debounces a Firestore write (600 ms), and can show a toast with Undo.
- `src/components/` — `Shell.tsx` (header, tab bar, + button), `Gate.tsx` (lock screen), `Sheet.tsx` (`useSheet().open(<X/>)`, one slide-up sheet at a time), `Toast.tsx`, `Charts.tsx`, `ui.tsx` (pills, hearts, meters, `AnimatedNumber`, chips, segmented control), `useThemeColors.ts`.
- `src/pages/` — one file per tab: `Home`, `CalendarPage`, `Places`, `Savings`.
- `src/sheets/` — `DateSheet` (quick update), `DateForm`, `ContribForm`, `PlaceForm`, `Menus` (+ menu, date picker, confirm), `Settings`.

## Data — do not break compatibility
- The whole plan is one Firestore document: `planner/may2027`, shape `{ state: <JSON string of Planner>, updatedAt: number }`. The previous single-file HTML version used the same document and the same localStorage key (`bp-may-planner-v1`), so existing data carries over. **Don't rename the document, the key, or existing fields.** Add new fields as optional and fill defaults in `normalize()`.
- Firestore rules allow read/write on `planner/{doc}` only for the two emails in `config.ts`. If you add a login, the rules in the Firebase console must be updated too (tell the user).
- Contributions must stay separate per person; never assume equal splits.
- A date marked Completed only counts as spending when `actual` is entered.
- Guard every division (no divide-by-zero); money inputs can't be negative.
- Demo data is marked with `demo: true` (contributions) and `demoP: true` (date progress); "Clear demo" removes only those.

## Design rules
- Pink theme. Colors are CSS variables in `src/index.css` (`:root` = light; dark values under `prefers-color-scheme: dark` **and** `[data-theme="dark"]`). Exposed to Tailwind via `@theme inline` (`bg-card`, `text-muted`, `text-rose-ink`, …). Never hard-code a color in a component; charts get colors from `useThemeColors()`.
- Fonts: Young Serif (headings, `font-display`) and Nunito (body).
- Phones: bottom tab bar, slide-up sheets with swipe-to-close, + button above the tab bar, safe-area insets respected. ≥760px: tabs become a top pill bar, sheets become centered cards.
- Respect `prefers-reduced-motion`. Keep animations subtle.
- No horizontal page scroll at 390px. Tap targets ≥ 40px.

## Before you push
1. `npm run typecheck` passes.
2. `npm run build` passes.
3. Check the change at phone width (390px) and desktop, in light and dark mode.
4. Explain the change to the user and ask before running `git push` (a push publishes the live site for both people).
