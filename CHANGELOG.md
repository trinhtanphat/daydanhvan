# Dạy đánh vần v0.2.0

Production mobile distribution and Cloudflare custom-domain release.

## Included

- Canonical production web/API origin: `https://daydanhvan.qs3d.site`.
- Cloudflare Worker Custom Domain configuration with Workers Static Assets, Hono API, D1, R2 and Durable Objects.
- Mobile clients default to the production Worker API and surface server connectivity/degraded state.
- Public web download center at `/downloads.html`.
- Worker endpoint `GET /api/v1/releases/latest` normalizes install/distribution assets from the latest GitHub Release.
- Android CI builds an installable APK on branches and `main`.
- Semantic mobile release workflow packages Android APK on every release tag and publishes a production-signed AAB when Android signing secrets are configured.
- iOS Ad Hoc and App Store/TestFlight-ready IPA workflows are implemented and publish real-device IPA files only when Apple Distribution certificate/provisioning profiles are configured.
- iOS Simulator `.app` remains CI-only and is never presented as a physical-device IPA.
- Release orchestration waits for matching `main` CI, Android and iOS validation before creating the semantic tag/GitHub Release.
- Cloudflare automatic deployment remains restricted to `main`.

## Distribution notes

Android APK can be sideloaded directly. If stable Android signing secrets are absent, the APK uses the generated Expo/Gradle development signing identity and is suitable for testing but should be replaced with a stable production key before public store distribution.

Physical iPhone installation requires Apple signing. Ad Hoc IPA additionally requires the target device UDID in the provisioning profile. App Store IPA is intended for TestFlight/App Store distribution.

## Required external credentials for full production delivery

- `CLOUDFLARE_API_TOKEN` for Cloudflare Worker/D1/R2/custom-domain deployment.
- `ANDROID_KEYSTORE_BASE64`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD` for stable Android production signing.
- `APPLE_CERTIFICATE_P12_BASE64`, `APPLE_CERTIFICATE_PASSWORD`, `APPLE_ADHOC_PROVISION_PROFILE_BASE64`, `APPLE_APPSTORE_PROVISION_PROFILE_BASE64` for signed iOS IPA output.

No signing material, Cloudflare token, or private teacher coordinate is committed to git.

---

# Dạy đánh vần v0.1.0

Initial platform release with responsive teacher discovery, Cloudflare Worker API, D1/R2/Durable Objects foundations, admin moderation, React Native iOS client and baseline CI/CD.
