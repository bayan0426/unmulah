# Deployment readiness

UNMULAH builds as a static Vite application:

```sh
npm ci
npm test
npm run typecheck
npm run build
```

Deploy the generated `dist/` directory to a static host. All public assets use
root-relative deploy-safe paths: the MediaPipe task and WASM files, MLP files,
and brand/favicon assets are copied from `public/` by Vite.

The app includes a lightweight Arabic web manifest using the existing brand mark.
It does **not** include a service worker or make an offline claim: caching camera,
MediaPipe, and model assets without field testing could create stale-runtime issues.

## Vercel and Netlify

Set the build command to `npm run build` and the publish directory to `dist`.
Configure a rewrite from unknown paths to `/index.html`, since the app uses
browser history routes such as `/quran` and `/sources`.

## GitHub Pages

GitHub Pages needs an SPA fallback strategy and a project-base-aware Vite
configuration before use. Do not enable Pages until that routing strategy has
been chosen and manually tested.

## Before deployment

- Re-verify the official Quran package, its provenance, and reuse terms before
  adding full text or Mushaf metadata.
- Do not add sign images or videos until each asset has a verified license and
  attribution entry.
- Test camera permission, model loading, and static-asset paths on HTTPS. Browser
  camera access normally requires a secure context (localhost is the development
  exception).
- Verify refresh on each direct route and test on mobile hardware.
