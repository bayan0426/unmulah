# Codex continuation

## Completed flagship P0
- Safety checkpoint: 9427391 Checkpoint page-first Quran experience.
- Page-first Quran reader is the default. It uses verified local Uthmani display text in a continuous page-based layout with inline ayah markers and page/Juz metadata.
- Page reader displays Quran text by default. Its explicit hide/show control preserves the ayah layout with placeholders and never persists a hidden default for a new visit.
- Supported Page-reader ayahs start live sign recitation on the same Quran route. The local camera panel preserves the existing MediaPipe/classifier/constrained decoding/stabilization/release/commit pipeline.
- The live reveal never inserts classifier output as Quran text. It progressively reveals only the original official display text for matching accepted raw labels. Non-matching classifier output remains separate feedback.
- Inline attempts retain retry, undo, finish, local-only processing, and deterministic comparison in an in-context result sheet.
- Smart Text remains the detailed review route with settings, search, audio, and the existing detailed review page.
- The unfinished duplicate test-yourself mode was removed.
- Quran availability is computed per Ayah through the existing verified target creator. Surah filters now expose full, partial, and unavailable states honestly.
- Navigation is Quran-first. The controlled More menu toggles, closes on outside interaction/Escape/navigation, and stays inside the viewport.
- Home has one Quran primary CTA and real local reading/listening/review totals.
- Library has official Mushaf Editions linked to the existing viewer route and a clearly non-functional future Dhikr Counter card.
- Profile, Progress, Library, desktop, and 390px mobile layouts remain covered by tests.

## Validation
- npm.cmd test: 57 passing
- npm.cmd run typecheck: passing
- npm.cmd run build: passing
- npm.cmd run test:e2e: 8 passing

## Intentional future / source blockers
- Exact native official Mushaf page assets remain unavailable with verified reusable terms. The application accurately calls the default reader a page-based layout, not a pixel-perfect printed Mushaf.
- Tafsir text and sign-Mushaf content remain unavailable without verified source/reuse terms.
- Do not modify public/arabic-sign/model/tmp5p8d9a03/ (permission denied).

No unfinished local P0 item remains from the final closure brief.
