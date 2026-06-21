# FDMate

Manual calorie tracker. Pick a date, add a food by name with either total
calories or calories-per-100g plus grams eaten; entries roll up into a daily
total. Days are browsable by day, week, and month.

Single-page React app. Data lives in Firebase Realtime Database (per-user JSON
blob), with `localStorage` as an offline cache. Google sign-in gates the app.

## Stack

- React 19 + Vite (single app at repo root)
- TypeScript (strict)
- SCSS design tokens, light/dark theming
- Firebase Auth (Google) + Realtime Database
- Vitest + Testing Library

## Setup

```bash
npm install
cp .env.example .env   # fill VITE_FIREBASE_* with the project's web config
npm run dev            # emulators + Vite on http://127.0.0.1:3000
```

`npm run dev` runs the Firebase Auth + Database emulators alongside Vite. In dev
the app auto-signs-in as `dev@fdmate.test` against the Auth emulator (no Google
popup). The RTDB emulator needs JDK 21+.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Emulators + dev server |
| `npm run build` | Typecheck + production build → `dist/` |
| `npm run typecheck` | TypeScript check |
| `npm run lint` | ESLint |
| `npm test` | Vitest |
| `npm run preview` | Build, then serve the bundle |
| `npm run emu` | Firebase emulators only |

## Layout

```
src/
  Main.tsx            entry
  App.tsx             shell: theme + header + screen
  ui/                 shared presentational components
  screens/            DayLogScreen
  features/log/       calorie-log feature (types, lib, data, useFoodLog, components)
  features/auth/      Google sign-in + emulator dev auth
  lib/                cross-cutting (theme, storageCache, firebase)
  styles/             SCSS foundation / layout / components
test/                 Vitest specs
```

## Deploy

Push to `main` triggers `.github/workflows/deploy-pages.yml`: lint, typecheck,
test, build, then publish `dist/` to GitHub Pages. The build reads
`VITE_FIREBASE_*` from repo Actions Variables. Add the Pages host to Firebase
Auth authorized domains before first deploy.
