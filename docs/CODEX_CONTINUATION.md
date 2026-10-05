# Codex continuation

## Completed
- Locked local MediaPipe, MLP classification, constrained decoding, stabilization, and deterministic comparison remain intact.
- Smart Quran reader has a continuous reading canvas, local reading/listening progress foundation, and four reader modes.
- Native Mushaf shell has page controls and immersive fallback around the official external viewer.
- Progress includes separate local reading/listening/review tracks and a 28-day activity heatmap.
- Global navigation now has a compact desktop primary navigation and mobile bottom navigation.
- Home is now a Quran-first journey: it uses real local reading/listening/review data, offers direct Quran and sign-recitation entry points, and keeps the three tracks separate.
- Reader-mode controls use real Arabic labels. Recite mode explains the supported local sign-recitation flow and does not claim support where it is unavailable.
- The supported practice screen now includes a Quran reference surface with a user-controlled text reveal around the unchanged camera flow.
- Deterministic comparison now has a responsive result-sheet presentation; its counts, confidence handling, and comparison algorithm are unchanged.
- Quran catalogue availability no longer claims Surah-wide recognition support; support remains checked at the selected Ayah level.
- Finishing a recitation attempt increments the local review-attempt track; it does not alter the recognition or comparison engines.
- Removed remaining placeholder question-mark strings from the Smart reader, Progress Khatmah tracks, and native Mushaf controls.
- Profile now has a local-only preference editor and accessibility panel; Library now separates the official Quran offering from source-pending religious material.
- Mobile Playwright coverage verifies Home, Quran, Surah, Progress, Profile, and Library at 390px without horizontal overflow.

## In progress
- Safe flagship UI backlog is complete; remaining items require verified external source or reuse decisions.

## Not completed
- Native Mushaf page assets are blocked pending verified reusable page-native assets.
- Tafsir and sign-Mushaf content remain blocked pending verified source and reuse terms.

## Open first
1. src/components/SmartQuranReader.tsx
2. src/App.tsx
3. src/components/HandTrackingCamera.tsx
4. src/components/ExperiencePages.tsx
5. src/index.css

## Next step
Obtain explicit reusable official native Mushaf page assets, Tafsir source terms, and sign-Mushaf reuse/embedding terms before implementing the remaining content.

## Known risks
- Do not alter the classifier, MediaPipe, preprocessing, constrained decoding, stabilization, or Quran comparison engine.
- Do not replace official displayed Quran text or use Emlaey text for display.
- Native page assets, Tafsir, and a verified sign Mushaf remain source-blocked and must stay truthful.
- public/arabic-sign/model/tmp5p8d9a03/ is inaccessible and must not be modified.
