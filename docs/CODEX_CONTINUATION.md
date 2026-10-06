# Codex continuation

## Final product-closure pass
- Safety checkpoint: `6809888 Checkpoint before final Mushaf UX fixes`.
- The Page Quran reader remains the default local KFGQPC reading surface. It starts in visible mode and never persists a hidden default.
- The rendering regression was fixed by explicitly assigning the supplied local `KFGQPC Hafs Smart` font to page ayah text. The official `aya_text` field remains the display source; the Emlaey field remains comparison-only.
- The desktop header now uses a three-column structural RTL layout: brand at the physical right, primary navigation centered, and More at the physical left. The original logo is visibly larger. Mobile retains its compact responsive header.
- More now contains only saved content and sources. The duplicate data-management and non-essential sign-access entries remain routable but are intentionally hidden.
- Inline Mushaf recitation remains local and on the Quran route. Its progressive reveal advances only for consecutive correct raw-label matches and clips/reveals only the original official display text. No prediction is ever inserted into Quran text.
- Inline feedback distinguishes correct, extra, and substituted accepted signals; deterministic final alignment provides missing, extra, and substituted review items. Undo and retry recompute/revert all local reveal and feedback state.
- Inline results name the score `نسبة التطابق` and include a current-attempt `راجع الأخطاء` view.
- Arabic-facing recitation feedback uses `arabicDisplayLabelFor` in `src/data/arabicSignLabels.ts`; unknown internal classes display `غير معروف` rather than a raw model identifier.
- The header continues to use the original logo, with a larger desktop/mobile mark while preserving its three-column RTL placement.
- Smart Text remains the separate advanced detailed-review route.

## Progress journey
- `ProgressJourneyPage` turns local activity, local attempt history, and the separate reading/listening/review counters into a Quran-journey view. It does not write any new activity or infer Quran access from the page opening.
- `src/data/progressJourney.ts` contains the three extensible stage definitions: البداية، الاستمرار، والثبات. Nodes are motivational only and never gate Quran access.
- `src/lib/progressJourney.ts` derives current/longest local-calendar streaks, active days, real reading/listening minutes, completed sign attempts, reviews, stage progress, and the next incomplete milestone.
- Current real metrics: active reading seconds, listening seconds, recorded reviews, local completed sign attempts, and local activity dates. Memorization/Hizb/Juz measurements intentionally remain empty because no trustworthy memorization data exists.
- Achievement cards are calculated from those same real metrics; a locked card is a progress state, never a claim that Quran content is unavailable.
- The map’s visual world is CSS/SVG only: a winding path, layered landscape, landmark motifs, current-node emphasis, stage preview, and medallion-style achievement states. No remote art or runtime dependency was added.

## Validation
- `npm.cmd test`: 61 passing
- `npm.cmd run typecheck`: passing
- `npm.cmd run build`: passing
- `npm.cmd run test:e2e`: 9 passing

## Safe local persistence
- Existing local attempt history is already implemented for the detailed-recitation flow. No new persistence was added in the closure pass because the required attempt review is available in-context and P0 stability takes priority.

## Remaining external/source blockers
- Exact native official Mushaf page assets remain unavailable with verified reusable terms. The application accurately calls the default reader a page-based layout, not a pixel-perfect printed Mushaf.
- Tafsir text and sign-Mushaf content remain unavailable without verified source/reuse terms.
- Do not modify `public/arabic-sign/model/tmp5p8d9a03/` (permission denied).

## Submission / delivery candidate

- Final submission source: the submission-candidate-v1 tag after the deployment configuration checkpoint.
- Restore tag: `submission-candidate-v1` (will be advanced only if final deployment configuration is committed).
- Hosting: Vercel static Vite deployment, with `vercel.json` SPA fallback.
- Vercel project: `bayan0426/unmulah`.
- Public URL: https://unmulah.vercel.app
- Production deployment: `dpl_HCcA4gkhqYgh8b5bGuTiEEDZqkeo`, status `Ready`.
- Public-root, direct-route refresh, Smart Quran data/font surface, hide/show, Progress, Library, and Profile were verified on the production origin.
- The production origin serves local MediaPipe and local classifier assets without request failures. The remote test browser could not provide a camera stream; a physical-device camera permission test remains required.

### Explicitly deferred
- Voice recitation
- Further Progress visual changes
- Dark mode
- English localization
- Expanded PWA work
- Blind-user haptic Quran research
- Additional verified Tafsir and sign-Mushaf sources
