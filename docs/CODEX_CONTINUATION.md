# Codex continuation

## Current validated checkpoint
- Preserved locked MediaPipe, local MLP classifier, constrained decoding, stabilization, automatic sequence building, and deterministic comparison.
- Rebuilt the application shell so Quran is the primary desktop and mobile destination; standalone primary recitation navigation was removed.
- Replaced the More control with a controlled accessible menu that toggles, closes on outside interaction and Escape, and closes before navigating.
- Simplified Home to one Quran primary action, an optional real-progress continuation action, and separate real local activity totals.
- Added PageQuranReader: the default Quran view is now a continuous page-based reading layout using verified local Uthmani display text, inline ayah markers, page metadata, and ayah actions.
- Retained Smart Text as a secondary interactive mode with settings, search, audio, and ayah actions.
- Removed the duplicate unfinished test-yourself reader mode.
- Restored per-Ayah audited availability computation in the Smart Text Surah index. Surahs show full, partial with supported/total counts, or unavailable based on the actual verified target creator.
- Unit tests and production build pass after this checkpoint.

## In progress
- Finish validation of the rewritten E2E suite for the new default page view and Smart Text switcher.

## Still required from flagship brief
1. Add Library cards for Mushaf editions (routing to the existing official viewer) and the future Dhikr counter.
2. Build primary live sign-recitation reveal inside the Quran page while preserving the current camera/state-machine core.
3. Complete final P0 desktop/mobile visual QA and update tests for menu behavior, availability filters, reader mode switching, supported/unsupported ayah flows, Library cards, and live reveal.
4. Add an optional low-risk PWA manifest if it can be verified locally.

## First files
1. src/components/QuranBrowser.tsx
2. src/components/PageQuranReader.tsx
3. src/components/SmartQuranReader.tsx
4. src/App.tsx
5. src/components/LibraryPage.tsx
6. e2e/app.spec.ts

## Exact next command
Run npm.cmd run test:e2e after stopping/reusing the stale local Playwright web server, then update its assumptions to the default page view and its explicit Smart Text switch.

## Source blockers
- Native official Mushaf page image/vector assets are not available with verified reusable terms.
- Tafsir content and full sign-Mushaf content remain unavailable without verified source/reuse terms.
- Do not modify public/arabic-sign/model/tmp5p8d9a03/ (permission denied).
