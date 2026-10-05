# Manual QA checklist

## Desktop and mobile

- [ ] Test Chrome or Edge desktop navigation and active page labels.
- [ ] Test at roughly 375px, 768px, and desktop width; no horizontal overflow.
- [ ] Verify RTL order, readable Arabic, focus outlines, and touch-sized controls.

## Quran journey

- [ ] Search `الإخلاص`, `الاخلاص`, and `112`.
- [ ] Test catalogue filters: الكل / التسميع الذكي متاح / قريبًا.
- [ ] Open Al-Ikhlas, inspect attribution, hide/show text, return to catalogue.
- [ ] Choose an unsupported Surah and verify no Quran text or AI capability is implied.

## Camera and recognition

- [ ] Permission granted: start, ready, hand absent, hand detected, stop, restart.
- [ ] Permission denied: Arabic recovery guidance is visible.
- [ ] Verify one hand, 21 overlay points, candidate, release, commit, repeated letter, undo, retry, and finish.
- [ ] Confirm details are collapsed by default and camera data remains local.

## Result and history

- [ ] Finish an attempt and inspect counts and reference-match percentage.
- [ ] Repeat the same attempt from history.
- [ ] Delete one attempt, clear all with confirmation, and confirm no camera media is stored.

## Accessibility and settings

- [ ] Navigate with keyboard only.
- [ ] Check `prefers-reduced-motion` behavior.
- [ ] Open sources/privacy and verify local-data controls.
- [ ] Check sign-access placeholders do not imply real sign assets.

## Automated mobile viewport check

Playwright covers the Home, Quran smart reader, Al-Ikhlas reading page, Progress, Profile, and Library at **390 × 844**. It verifies that the mobile navigation is visible and that the document does not overflow horizontally. This does not request camera permission or start a camera stream.
