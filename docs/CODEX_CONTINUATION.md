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
- Smart Text remains the separate advanced detailed-review route.

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
