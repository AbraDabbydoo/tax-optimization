# State Tax Data Workflow

This doc explains where the state tax data lives, which file to edit, how it gets served to the app, and how to keep everything in sync.

## Overview

- Two locations hold the same JSON data on purpose:
  - `updated-tax-data/state-tax-data-updated.json` (backend working copy)
  - `public/updated-tax-data/state-tax-data-updated.json` (served to the browser)
- You edit the backend copy, then a script copies it into `public/` for the app to load at runtime.

## Canonical Source (Edit This One)

- Canonical: `updated-tax-data/state-tax-data-updated.json`
- Do not hand‑edit the `public/` copy; it is overwritten by the sync script during builds.

## How the App Loads Data

- Server-side: Prefers `public/updated-tax-data/state-tax-data-updated.json` with fallback to legacy paths.
  - `lib/state-tax-data.ts:107`
- Client-side: Fetches from `/updated-tax-data/state-tax-data-updated.json` (served from `public/…`).
  - `lib/state-tax-data.ts:128`

## Edit → Sync → Verify

1) Edit the backend file
   - Path: `updated-tax-data/state-tax-data-updated.json`
   - Example: update `IA.incomeTax.standardDeduction` values.

2) Sync to `public/`
   - Manual: `npm run sync:data`
   - Build-time: `npm run build` (auto-runs the sync via `prebuild`)
   - Script: `scripts/copy-updated-data.js`

3) Verify in the app
   - Start dev: `npm run dev`
   - The app reads from `public/updated-tax-data/state-tax-data-updated.json`. Ensure you synced before testing.

## What Gets Synced

- From: `updated-tax-data/`
- To: `public/updated-tax-data/`
- Files (by default):
  - `state-tax-data-updated.json`
  - `state-tax-data-2-updated.json`
  - `integration-summary.json`

## Data Shape Notes

- Standard deduction keys supported: `single`, `married`, `headOfHousehold`, `marriedSeparate`.
- The calculator also accepts bracketed standard deductions (arrays with `agiMin`, `agiMax`, `deduction`).
  - See: `lib/tax-calculator.ts:4908`–`4924` for resolution logic.

## Troubleshooting

- “I don’t see my changes in the UI”:
  - Run `npm run sync:data` (or build) to copy backend → public.
  - Restart `npm run dev` if needed.
  - Confirm the path the app reads: `lib/state-tax-data.ts:128`.

- “Public and backend files differ”:
  - Treat `updated-tax-data/` as the source of truth and re-run `npm run sync:data`.

## Automation

- Pre-build sync: `prebuild` runs automatically before `npm run build`.
- Pre-dev sync: `predev` runs automatically before `npm run dev`.

## FAQ

- Why two copies?
  - `public/` is what Next.js serves to the browser. Keeping a working copy under `updated-tax-data/` allows you to edit and version data, then sync to `public/` on demand.

- Can I edit only the public file?
  - You can, but the build will overwrite it from `updated-tax-data/` (via `prebuild`). Best practice: edit the backend copy and sync.
