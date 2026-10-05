# Codex continuation

## Completed
- Locked local MediaPipe, MLP classification, constrained decoding, stabilization, and deterministic comparison remain intact.
- Smart Quran reader has a continuous reading canvas, local reading/listening progress foundation, and four reader modes.
- Native Mushaf shell has page controls and immersive fallback around the official external viewer.
- Progress includes separate local reading/listening/review tracks and a 28-day activity heatmap.
- Global navigation rebuild is in progress: the primary desktop navigation and mobile bottom navigation were added in the current working tree.

## In progress
- Validate and commit the global navigation rebuild, then rebuild Home around the next Quran action rather than the existing dashboard composition.

## Not completed
- Home structural rebuild.
- Recitation embedded in Quran surface and result sheet presentation.
- Full progress/profile/library editorial layouts and mobile visual review.
- Native Mushaf page assets are blocked pending verified reusable page-native assets.
- Tafsir and sign-Mushaf content remain blocked pending verified source and reuse terms.

## Open first
1. src/App.tsx
2. src/components/SmartQuranReader.tsx
3. src/components/ExperiencePages.tsx
4. src/index.css
5. docs/FEATURE_STATUS.md

## Next step
Run build and Playwright for the navigation change; if green, commit it, then extract and replace `Home` in `src/App.tsx` with a Quran-first resume journey layout.

## Known risks
- Do not alter the classifier, MediaPipe, preprocessing, constrained decoding, stabilization, or Quran comparison engine.
- Do not replace official displayed Quran text or use Emlaey text for display.
- `public/arabic-sign/model/tmp5p8d9a03/` is inaccessible and must not be modified.
