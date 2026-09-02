# Mobile Distribution + Cloudflare Production Design

## Goal

Ship Dạy đánh vần as one production system where the public web app and API run on Cloudflare Workers at `https://daydanhvan.qs3d.site`, while Android and iOS builds are produced from GitHub tags and connect to that same Worker API after installation.

## Production topology

- `https://daydanhvan.qs3d.site` is the canonical public origin.
- Cloudflare Worker `daydanhvan` serves the React/Vite SPA through Workers Static Assets.
- `/api/v1/*` is handled by the Hono Worker before static assets.
- D1 stores relational data, R2 is the media boundary, and Durable Objects handle realtime chat rooms.
- The Worker is attached to `daydanhvan.qs3d.site` as a Cloudflare Custom Domain (`custom_domain: true`).
- Only pushes to `main` may run the Cloudflare production deployment workflow.

## Mobile runtime contract

- Mobile production API base URL defaults to `https://daydanhvan.qs3d.site`.
- `EXPO_PUBLIC_API_URL` may override the base URL for development/testing only.
- Android and iOS use the same `/api/v1` contract and never depend on a localhost or `workers.dev` URL in release builds.
- App startup checks `/api/v1/health`; failure is surfaced as an offline/degraded state instead of silently pretending demo data is live production data.

## Distribution contract

### Android

Each semantic release tag `vX.Y.Z` builds an Android APK suitable for sideloading and an AAB suitable for Play Console submission. A stable production signing identity must come from GitHub Actions secrets. If production signing secrets are absent, the workflow may produce an explicitly named development-signed APK for testing, but must never label it Play-production signed.

Expected release assets:

- `daydanhvan-android-vX.Y.Z.apk`
- `daydanhvan-android-vX.Y.Z.aab` when production signing is configured

### iOS

A real-device IPA requires Apple signing. The release pipeline supports:

- Ad Hoc IPA when an Apple Distribution certificate and Ad Hoc provisioning profile are configured.
- App Store/TestFlight-ready IPA when App Store signing credentials are configured.
- Simulator `.app` remains a CI validation artifact only and is not presented as an installable iPhone release.

Expected release assets when signing secrets are available:

- `daydanhvan-ios-adhoc-vX.Y.Z.ipa`
- `daydanhvan-ios-appstore-vX.Y.Z.ipa`

The pipeline must fail or clearly skip the signed IPA jobs when Apple credentials are absent; it must never claim an unsigned package is installable on a physical iPhone.

## Web install center

The public web app exposes a `Tải ứng dụng` section/page that reads a Worker endpoint backed by the latest GitHub Release metadata and shows platform-specific assets:

- Android APK download for sideloading.
- Android AAB marked for Play Console, not direct installation.
- iOS Ad Hoc IPA only when published.
- TestFlight/App Store path when configured.

The page explains that iOS Ad Hoc installs only on devices included in the provisioning profile.

## Release metadata endpoint

The Worker exposes `GET /api/v1/releases/latest`, fetches the public GitHub latest-release API for `trinhtanphat/daydanhvan`, selects only approved asset suffixes, and returns normalized release metadata. Responses are cacheable and do not expose GitHub credentials.

## Git workflow

- Development happens on `feat/**` or `fix/**` branches.
- PR/branch CI runs typecheck, tests, web/admin builds, Worker dry-run, release-contract verification, Android build verification and iOS simulator verification.
- Merge to `main` is allowed only after green checks.
- Cloudflare deploy workflow triggers only on `main` or explicit manual dispatch.
- Semantic tag/release automation runs only after matching `main` CI and mobile validation succeed.
- Tag release jobs build artifacts from the exact tag/commit SHA, not from a moving branch.

## Cloudflare deployment

Wrangler production config contains:

```json
{
  "routes": [
    {
      "pattern": "daydanhvan.qs3d.site",
      "custom_domain": true
    }
  ]
}
```

The GitHub deploy job provisions/looks up D1 `daydanhvan-db` and R2 `daydanhvan-media`, generates bound Wrangler config, applies migrations, deploys the Worker, and smoke-tests `https://daydanhvan.qs3d.site/api/v1/health`.

Cloudflare authentication remains in GitHub secret `CLOUDFLARE_API_TOKEN`; no API token is committed. The token must have permissions needed for Workers Scripts, Workers Routes/Custom Domains, D1, R2, and access to the `qs3d.site` zone.

## Required secrets for fully signed releases

Cloudflare:

- `CLOUDFLARE_API_TOKEN`
- `ADMIN_API_KEY` (optional admin API protection)

Android production signing:

- `ANDROID_KEYSTORE_BASE64`
- `ANDROID_KEYSTORE_PASSWORD`
- `ANDROID_KEY_ALIAS`
- `ANDROID_KEY_PASSWORD`

Apple signing:

- `APPLE_CERTIFICATE_P12_BASE64`
- `APPLE_CERTIFICATE_PASSWORD`
- `APPLE_ADHOC_PROVISION_PROFILE_BASE64`
- `APPLE_APPSTORE_PROVISION_PROFILE_BASE64`
- App Store Connect credentials when upload to TestFlight is enabled.

## Acceptance criteria

1. `daydanhvan.qs3d.site` is present in committed Worker production routing and smoke tests.
2. Mobile production API defaults to that origin and health connectivity is visible to the user.
3. Latest-release API returns only recognized Android/iOS artifacts.
4. Web exposes an application download/install center.
5. Android release workflow builds a tag-scoped installable APK; production AAB uses stable signing when secrets exist.
6. iOS signed IPA workflows are implemented and correctly gated on Apple credentials; simulator output is never presented as a physical-device IPA.
7. `main` is the only automatic Cloudflare deployment branch.
8. CI verifies release configuration before merge.
9. No signing material or Cloudflare token is committed.
