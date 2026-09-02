# Dạy đánh vần

Monorepo for a privacy-aware teacher discovery experience with a Cloudflare Workers backend, responsive web app, and Expo/React Native mobile clients for iOS and Android.

## Production URLs

- Public web + API: `https://daydanhvan.qs3d.site`
- Health: `https://daydanhvan.qs3d.site/api/v1/health`
- Latest mobile release metadata: `https://daydanhvan.qs3d.site/api/v1/releases/latest`
- App download center: `https://daydanhvan.qs3d.site/downloads.html`

Both iOS and Android production builds use the same Cloudflare Worker API origin. `EXPO_PUBLIC_API_URL` is only an override for development/testing.

## Apps

- `apps/web` — React + Vite web experience and public download center.
- `apps/api` — Hono API on Cloudflare Workers.
- `apps/mobile` — Expo/React Native client for iOS and Android.
- `apps/admin` — moderation surface.

## Platform

- Cloudflare Workers + Workers Static Assets
- Custom Domain `daydanhvan.qs3d.site`
- D1 relational data
- R2 media boundary
- Durable Objects for realtime chat
- GitHub Actions for CI, Cloudflare deploy and mobile binaries

## Git / deployment flow

1. Work on `feat/**` or `fix/**`.
2. CI, Android and iOS simulator validation run before merge.
3. Merge to `main` only after green checks.
4. Only `main` automatically runs `Deploy Cloudflare`.
5. After matching `main` CI + Android + iOS validation succeeds, the release workflow creates the semantic tag/GitHub Release.
6. Mobile release packaging checks out that exact tag and attaches Android/iOS binaries.

## Cloudflare production deploy

The Worker is configured with a Cloudflare Custom Domain:

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

Set `CLOUDFLARE_API_TOKEN` in GitHub Actions secrets. The token must be able to deploy Workers and manage the D1/R2 resources and custom domain in the Cloudflare account that owns `qs3d.site`.

The deploy workflow provisions/looks up:

- D1: `daydanhvan-db`
- R2: `daydanhvan-media`

It then applies migrations, deploys the Worker/static assets, and smoke-tests the canonical custom domain.

## Android release

Every mobile release produces an installable APK named like:

`daydanhvan-android-v0.2.0.apk`

For stable production signing and Play Console AAB output, configure:

- `ANDROID_KEYSTORE_BASE64`
- `ANDROID_KEYSTORE_PASSWORD`
- `ANDROID_KEY_ALIAS`
- `ANDROID_KEY_PASSWORD`

With those secrets present, the release also attaches:

`daydanhvan-android-v0.2.0.aab`

Without stable signing secrets, the APK still builds with the generated Expo/Gradle development signing identity for sideload testing, but it should not be treated as the long-term production signing identity.

## iOS release

A Simulator `.app` is only a CI validation artifact and cannot be installed on a physical iPhone.

Real-device IPA output requires Apple signing secrets:

- `APPLE_CERTIFICATE_P12_BASE64`
- `APPLE_CERTIFICATE_PASSWORD`
- `APPLE_ADHOC_PROVISION_PROFILE_BASE64`
- `APPLE_APPSTORE_PROVISION_PROFILE_BASE64`

When configured, the release workflow can attach:

- `daydanhvan-ios-adhoc-v0.2.0.ipa` — direct Ad Hoc installation on registered device UDIDs.
- `daydanhvan-ios-appstore-v0.2.0.ipa` — App Store/TestFlight distribution package.

## Local development

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm build:web
pnpm --filter @daydanhvan/api dev
```

## Release

Current planned semantic release: `v0.2.0`.
