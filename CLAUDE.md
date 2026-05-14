# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A Bulgarian-language Expo / React Native reference app for ADR (European agreement on transport of dangerous goods). Users search ~1800 hazardous substances by name or UN number, browse them by ADR class, and look up emergency-response (ERI) instructions and isolation/evacuation distances. The data is shipped as a read-only SQLite database bundled with the app — there are no servers, no auth, no writes.

This is Expo SDK 54 with `newArchEnabled: true` and the React Compiler experiment enabled (`app.json` → `experiments.reactCompiler`). Routing is via `expo-router` (file-based, in `app/`). Typed routes are on.

## Commands

```bash
npm start              # expo dev server (QR / menu)
npm run ios            # open on iOS simulator
npm run android        # open on Android emulator
npm run web            # web build
npm run lint           # expo lint (eslint-config-expo, flat config)
```

There are no tests in this repo.

### Rebuilding the SQLite database

`assets/db/adrzone.db` is generated, not hand-written. To regenerate it from the legacy SQL dump:

```bash
node scripts/build-db.mjs <path-to-queries.js> <output-db-path>
# defaults: /tmp/adrzone/assets/www/js/queries.js  →  /tmp/dbbuild/adrzone.db
```

`legacy/queries.js` in this repo is the source-of-truth dump (a JS file exporting a `queries` array of SQL statements from the original web app). The script `eval`s it via `new Function`, writes the statements to a temp `.sql` file, and pipes them through the `sqlite3` CLI — so the `sqlite3` binary must be on PATH. After building, copy the result over `assets/db/adrzone.db` and reinstall the app so the bundled asset is repackaged.

## Architecture

### Routing (`app/`)

- `app/_layout.tsx` — root `Stack`, applies theme to nav chrome, mounts `SafeAreaProvider` and `StatusBar`.
- `app/(tabs)/_layout.tsx` — bottom `Tabs` group: Search / Browse / About.
- `app/(tabs)/index.tsx` — search screen. Debounces input via `useDebounced` (220 ms). Numeric queries match both `un_number` and `substance`; otherwise only `substance`.
- `app/(tabs)/browse.tsx` — lists ADR classes; tapping a class navigates to the search tab with `?adrClass=...` (note: the search screen does not currently consume this param).
- `app/(tabs)/about.tsx` — static info / disclaimer.
- `app/substance/[id].tsx` — substance detail. Uses `@react-native-segmented-control/segmented-control` to switch between three sections: Basic fields, ERI instruction (rendered as HTML in a `WebView`), and distances (only shown if `getDistances` returned rows).

### Data layer (`src/db/`)

- `index.ts` — `getDb()` returns a memoized `Promise<SQLiteDatabase>`. On first call it ensures `<documents>/SQLite/` exists, then if `adrzone.db` is not yet copied there, it pulls the bundled asset via `Asset.fromModule(require('../../assets/db/adrzone.db'))`, `downloadAsync()`s it, and copies it into place. `expo-sqlite` opens databases by name from that directory — it cannot read directly from the asset bundle, so this copy-on-first-launch step is mandatory.
- `queries.ts` — all read queries. Schema (joined across these tables): `substances`, `hin_codes`, `adr_classes`, `classify_codes`, `packing_groups`, `distances`, `instructions`. The `substances.has_distance` field in search results is computed via an `EXISTS` subquery, not a stored column.
- `types.ts` — row types matching the schema. All values come back as strings or null (the DB has no numeric coercion).

### Metro / asset config

- `metro.config.js` adds `'db'` to `resolver.assetExts` so `require('.../adrzone.db')` resolves.
- `app.json` → `assetBundlePatterns` ensures `assets/db/**`, `assets/danger-labels/**`, and `assets/images/**` are bundled into release builds.
- TypeScript path alias `@/*` maps to the repo root (`tsconfig.json`).

### UI conventions

- All user-facing strings live in `src/i18n/bg.ts` and are Bulgarian only — there is no i18n framework, just an object literal. New strings go there; do not inline Bulgarian copy in components.
- Theming is purely a function of `useColorScheme()`: `src/theme/useTheme.ts` returns either `lightPalette` or `darkPalette` from `src/theme/colors.ts`. There is no theme context / provider. Components call `useTheme()` directly and spread color values into inline styles.
- `src/components/HtmlView.tsx` wraps `react-native-webview` and injects theme-aware CSS into the HTML document; it's used for the ERI instruction blob (stored as HTML in `instructions.instruction`).
- Danger-label images are referenced by filename strings stored in the DB (`adr_classes.danger_labels`, comma-separated). `src/lib/dangerLabels.ts` maps each filename to a static `require(...)` of the PNG/GIF in `assets/danger-labels/` — RN's bundler needs literal `require` calls, so any new label asset must be added to that map explicitly.

### What's *not* here

- The starter `create-expo-app` template files (`components/themed-*`, `hooks/use-color-scheme*`, `constants/theme.ts`, `app/(tabs)/explore.tsx`, `app/modal.tsx`, `scripts/reset-project.js`) are being removed — they're listed as deleted in `git status` and have been replaced by code under `src/`. Don't add new code under the top-level `components/`, `hooks/`, or `constants/` directories; everything new goes in `src/`.
- No native iOS/Android folders exist — this is a managed Expo project. Native builds happen via EAS or `expo prebuild`.
