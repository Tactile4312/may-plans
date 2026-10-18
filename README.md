# Our May — date planner

A shared date planner, budget tracker and savings tracker for two people.
Built with **React + TypeScript + Vite + Tailwind CSS**, data synced through **Firebase**, hosted free on **GitHub Pages**.

---

## 1. One-time setup on your computer

You already have VS Code and Git. You also need **Node.js**:

1. Download the **LTS** version from <https://nodejs.org> and install it (keep the default options).
2. Close and reopen VS Code so it picks up Node.
3. Check it worked: open VS Code's terminal (**Terminal → New Terminal**) and run:
   ```bash
   node -v
   npm -v
   ```
   Both should print a version number.

## 2. Move your repository to the new version

1. **Get your repository on your computer.** In VS Code, open the Command Palette (`Ctrl+Shift+P`), choose **Git: Clone**, paste `https://github.com/Tactile4312/may-plans` and pick a folder. Open it when VS Code asks.
2. **Delete the old files** in that folder: `index.html`, `sw.js`, `manifest.webmanifest`, and the `.png` icons. Leave the hidden `.git` folder alone.
3. **Copy everything from this project** into the folder, including the hidden `.github` folder and `.gitignore`.
4. **Install the packages** (downloads React, Firebase and the rest into `node_modules`):
   ```bash
   npm install
   ```
5. **Run it on your computer:**
   ```bash
   npm run dev
   ```
   Open the link it prints (usually <http://localhost:5173/may-plans/>). Changes you save in VS Code appear instantly in the browser.
   Logging in works here too, and it uses your **real** shared plan, so edits are live for Peachy as well.

## 3. Publish it

1. On GitHub, open your repository → **Settings → Pages**. Under **Build and deployment → Source**, choose **GitHub Actions**. (You only do this once.)
2. In the VS Code terminal:
   ```bash
   git add .
   git commit -m "Rebuild planner in React"
   git push
   ```
3. Open the **Actions** tab on GitHub to watch it build. After about 1–2 minutes it turns green and your site at `https://tactile4312.github.io/may-plans/` shows the new version.

From now on, every `git push` to `main` rebuilds and publishes automatically.

> Commit the `package-lock.json` file that `npm install` creates. It locks exact package versions so GitHub builds the same thing you tested.

---

## Everyday commands

| Command | What it does |
|---|---|
| `npm run dev` | Runs the site on your computer with live reload |
| `npm run build` | Builds the final site into `dist/` (GitHub does this for you) |
| `npm run preview` | Serves the built `dist/` folder to check it before pushing |
| `npm run typecheck` | Checks the TypeScript types without building |

---

## How the code is organised

```
may-plans/
├── .github/workflows/deploy.yml   GitHub Actions: build + publish on every push
├── public/                        Copied as-is: app icons, manifest, offline worker (sw.js)
├── index.html                     The page shell; React fills in <div id="root">
├── vite.config.ts                 Build settings (base path must match the repo name)
└── src/
    ├── main.tsx                   Entry point: wraps the app in "providers"
    ├── App.tsx                    Lock screen or the app; tab switching; the + button
    ├── config.ts                  ← Firebase settings, logins, month. Edit here.
    ├── index.css                  Colors (light + dark), Tailwind setup, component styles
    ├── lib/                       Plain TypeScript, no React
    │   ├── types.ts               The shape of the data (DateItem, Contribution, Place, Planner)
    │   ├── defaults.ts            The original May itinerary and starter places
    │   ├── format.ts              Peso formatting, dates, links, categories
    │   ├── totals.ts              All dashboard math (remaining budget, averages, shares)
    │   ├── plan.ts                Helpers: sorted dates, next free weekend, clear demo
    │   ├── firebase.ts            Connects to Firebase
    │   └── storage.ts             Safe localStorage helpers
    ├── state/                     Shared app state (React Context)
    │   ├── auth.tsx               Who is signed in, sign in / sign out
    │   └── planner.tsx            The plan itself + syncing with Firestore + undo
    ├── components/                Reusable building blocks
    │   ├── Shell.tsx              Header, tab bar, + button
    │   ├── Gate.tsx               The lock screen
    │   ├── Sheet.tsx              Slide-up sheets (one at a time)
    │   ├── Toast.tsx              "Saved ✓" messages with Undo
    │   ├── Charts.tsx             The four charts (Recharts)
    │   ├── ui.tsx                 Pills, hearts, meters, animated numbers, chips
    │   └── useThemeColors.ts      Gives charts the current light/dark colors
    ├── pages/                     One file per tab
    │   ├── Home.tsx               Next date, budget cards, charts, week plans
    │   ├── CalendarPage.tsx       Month grid + date tracker
    │   ├── Places.tsx             Places to go
    │   └── Savings.tsx            Savings cards, charts, contributions
    └── sheets/                    What slides up when you tap something
        ├── DateSheet.tsx          Quick view of a date: status, spent, rating, notes
        ├── DateForm.tsx           Add / edit a date
        ├── ContribForm.tsx        Add / edit savings
        ├── PlaceForm.tsx          Add / edit a place
        ├── Menus.tsx              The + menu, date picker, confirm box
        └── Settings.tsx           Names, light/dark, backup, reset, lock
```

### The big ideas, in order of how data flows

1. **Types first** (`lib/types.ts`). TypeScript knows exactly what a date or a contribution looks like, so VS Code autocompletes fields and flags typos before you run anything.
2. **State lives in one place** (`state/planner.tsx`). Components read the plan with `usePlanner()` and change it with `update(draft => { ... })`. You edit a copy; `update` saves it locally, syncs it to Firestore after a short pause, and can show a toast with Undo.
3. **Pages are just functions** that take the plan and return what to show. When the plan changes, React re-renders only what changed.
4. **Sheets** are opened with `useSheet().open(<SomeForm />)`, from anywhere.
5. **Styling** uses Tailwind utility classes for layout (`flex`, `gap-2`, `md:grid-cols-2`) and a few named classes in `index.css` for repeated pieces (`.card`, `.btn`, `.pill`). Colors are CSS variables, so dark mode only swaps the variables.

### Try these first changes to learn your way around

- Change the greeting in `components/Shell.tsx` (search for `Hi, `).
- Add a new date type: add it to `CATS` and give it a color in `CAT_COLORS` (both in `lib/format.ts`).
- Change the accent color: edit `--rose` in `src/index.css` (both the light and dark blocks).
- Plan a different month: change `YEAR` / `MONTH` in `src/config.ts`, the itinerary in `lib/defaults.ts`, and `PLAN_DOC.id` so it saves to a new document.

Save, and the browser running `npm run dev` updates right away.

---

## Data and logins

- The plan is stored in Firestore at `planner/may2027`, the same place the old version used, so your data carries over.
- Logins are Firebase Authentication users listed in `config.ts`. Each person's password is their passcode.
- Firestore rules allow only those two emails to read or write.
- A copy is also kept in the browser so the app opens instantly; Firestore is the source of truth.
