# Importing verified sign assets

Do not download or bulk-import datasets through this repository. Prepare a local
selection manifest for only the approved assets:

```json
{
  "assets": [{
    "arabicLetter": "ا",
    "rawLabel": "aleff",
    "mediaType": "image",
    "sourcePath": "C:/approved-assets/alef.png",
    "sourceOrganization": "Organization",
    "sourceUrl": "https://source.example",
    "license": "CC BY 4.0",
    "attribution": "Required attribution text",
    "verificationStatus": "verified"
  }]
}
```

Run:

```sh
node scripts/import_sign_assets.mjs path/to/selection.json
```

The importer copies only manifest-selected files, rejects missing metadata,
pending verification, duplicate Arabic letters, and duplicate raw labels. It
produces `public/sign-assets/manifest.json` with attribution metadata. A human
must still review visual correctness, license scope, and raw-label mapping before
enabling assets in `localSignAssetProvider`.
