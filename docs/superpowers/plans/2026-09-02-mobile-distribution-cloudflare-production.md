# Mobile Distribution + Cloudflare Production Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Produce Android/iOS release artifacts from semantic tags, make installed apps call `https://daydanhvan.qs3d.site`, expose a web install center, and deploy Cloudflare only from `main`.

**Architecture:** Keep the existing Expo/React Native app and Hono Worker. Add a shared mobile production-origin config, a Worker latest-release proxy, a web install view, tag-scoped Android/iOS release workflows, and a Cloudflare Custom Domain route. Release jobs are strict about signing: Android gets a sideloadable APK; iOS physical-device IPA is emitted only with Apple signing credentials.

**Tech Stack:** TypeScript 5.9, React/Vite, Hono, Expo 54/React Native 0.81, Cloudflare Workers Static Assets/D1/R2/Durable Objects, GitHub Actions, Gradle/Xcode.

**Spec:** `docs/superpowers/specs/2026-09-02-mobile-distribution-cloudflare-production-design.md`

## Global Constraints

- Canonical production origin is exactly `https://daydanhvan.qs3d.site`.
- Automatic Cloudflare deployment occurs only from `main`.
- Release builds are tied to exact semantic tags `vX.Y.Z`.
- Simulator `.app` is CI-only and must not be described as a physical-iPhone install artifact.
- No Cloudflare token, Android keystore, Apple certificate, or provisioning profile may be committed.

---

### Task 1: Release contract test

**Files:**
- Create: `scripts/verify-production-release-contract.mjs`
- Modify: `.github/workflows/ci.yml`

**Interfaces:**
- Consumes repository configuration files.
- Produces a CI gate that verifies custom domain, mobile production origin, main-only deploy trigger, and expected release workflow markers.

- [ ] **Step 1: Write failing verification script**

The script reads `wrangler.jsonc`, `apps/mobile/src/config.ts`, `.github/workflows/deploy-cloudflare.yml`, and `.github/workflows/mobile-release.yml`; it asserts the canonical origin and tag release outputs. Initially it must fail because the production config/release workflow is missing.

- [ ] **Step 2: Run via CI and verify RED**

Expected: failure mentioning missing `apps/mobile/src/config.ts` or missing release workflow.

- [ ] **Step 3: Add the verification command to CI**

Run `node scripts/verify-production-release-contract.mjs` before secret-pattern guard.

- [ ] **Step 4: Commit**

`test: define production release contract`

### Task 2: Production mobile API configuration

**Files:**
- Create: `apps/mobile/src/config.ts`
- Modify: `apps/mobile/src/api.ts`
- Modify: `apps/mobile/App.tsx`
- Modify: `apps/mobile/app.json`

**Interfaces:**
- Produces `PRODUCTION_ORIGIN`, `getApiBaseUrl()`, `getHealthUrl()`.
- `loadMobileTeachers()` uses `getApiBaseUrl()`.

- [ ] **Step 1: Implement production origin fallback**

Default API origin to `https://daydanhvan.qs3d.site`, with `EXPO_PUBLIC_API_URL` only as an override.

- [ ] **Step 2: Add health connectivity state**

On app startup call `/api/v1/health` and show `Đang kết nối`, `Đã kết nối máy chủ`, or `Ngoại tuyến` in the account/status surface.

- [ ] **Step 3: Remove silent production ambiguity**

Teacher fallback remains available, but UI marks degraded/offline state if the Worker cannot be reached.

- [ ] **Step 4: Typecheck**

Run mobile TypeScript typecheck.

### Task 3: Worker latest-release endpoint

**Files:**
- Create: `apps/api/src/releases.ts`
- Create: `apps/api/src/releases.test.ts`
- Modify: `apps/api/src/index.ts`

**Interfaces:**
- Produces `normalizeRelease(payload)` and `GET /api/v1/releases/latest`.
- Endpoint returns `{ tagName, name, publishedAt, assets[] }` where asset kinds are `android-apk`, `android-aab`, `ios-adhoc`, `ios-appstore`.

- [ ] **Step 1: Write failing tests**

Tests verify unknown assets are excluded and recognized file suffixes are normalized.

- [ ] **Step 2: Verify RED**

Run API Vitest and confirm missing module/function failure.

- [ ] **Step 3: Implement normalizer + endpoint**

Fetch `https://api.github.com/repos/trinhtanphat/daydanhvan/releases/latest`, send GitHub API headers, normalize assets, cache response with `Cache-Control`.

- [ ] **Step 4: Verify GREEN**

Run API tests.

### Task 4: Web install center

**Files:**
- Modify: `apps/web/src/App.tsx`
- Modify: `apps/web/src/styles.css`

**Interfaces:**
- Consumes `/api/v1/releases/latest`.
- Shows Android APK/AAB and iOS install options with correct platform explanations.

- [ ] **Step 1: Add `Tải ứng dụng` navigation/action**
- [ ] **Step 2: Fetch release metadata and render platform cards**
- [ ] **Step 3: Label AAB as Play Console-only and Ad Hoc IPA as registered-device-only**
- [ ] **Step 4: Build web**

### Task 5: Cloudflare custom-domain production deployment

**Files:**
- Modify: `wrangler.jsonc`
- Modify: `scripts/smoke-cloudflare.mjs`
- Modify: `.github/workflows/deploy-cloudflare.yml`

**Interfaces:**
- Worker route pattern exactly `daydanhvan.qs3d.site` with `custom_domain: true`.
- Smoke test targets `https://daydanhvan.qs3d.site/api/v1/health`.

- [ ] **Step 1: Add custom domain route**
- [ ] **Step 2: Make smoke test canonical-domain based**
- [ ] **Step 3: Keep automatic trigger limited to `main`**
- [ ] **Step 4: Preserve secret-gated deployment and explicit failure/skip messaging**

### Task 6: Android tag release pipeline

**Files:**
- Create: `.github/workflows/mobile-release.yml`

**Interfaces:**
- Trigger: tags `v*` and manual dispatch with existing tag.
- Produces `daydanhvan-android-<tag>.apk`; produces production AAB when signing secrets exist.

- [ ] **Step 1: Checkout exact tag and install dependencies**
- [ ] **Step 2: Expo prebuild Android**
- [ ] **Step 3: Build a sideload APK**
- [ ] **Step 4: If Android signing secrets exist, decode temporary keystore and build signed release APK/AAB**
- [ ] **Step 5: Upload artifacts and attach to matching GitHub Release**

### Task 7: iOS signed release pipeline

**Files:**
- Modify: `.github/workflows/mobile-release.yml`

**Interfaces:**
- Uses Apple secrets only inside temporary macOS keychain/profile directories.
- Produces Ad Hoc/App Store IPA only when corresponding credentials exist.

- [ ] **Step 1: Expo prebuild iOS + CocoaPods**
- [ ] **Step 2: Install distribution certificate in temporary keychain**
- [ ] **Step 3: Install Ad Hoc/App Store provisioning profile**
- [ ] **Step 4: Archive exact tag with `xcodebuild archive`**
- [ ] **Step 5: Export IPA using explicit `ExportOptions.plist`**
- [ ] **Step 6: Attach signed IPA to GitHub Release**
- [ ] **Step 7: When secrets are absent, skip signed IPA steps with clear summary, never create fake IPA**

### Task 8: Release orchestration and docs

**Files:**
- Modify: `.github/workflows/release.yml`
- Modify: `README.md`
- Modify: `CHANGELOG.md`

**Interfaces:**
- Release workflow creates tag/release after matching `main` CI + iOS validation; mobile-release then builds assets from the exact tag.

- [ ] **Step 1: Keep tag/release creation idempotent**
- [ ] **Step 2: Document required Cloudflare/Android/Apple secrets**
- [ ] **Step 3: Document direct-install constraints accurately**
- [ ] **Step 4: Run full CI and mobile builds on branch/PR**
- [ ] **Step 5: Merge only after green**
- [ ] **Step 6: Verify main CI and Cloudflare deploy result**
- [ ] **Step 7: Verify GitHub Release assets and report any signing-secret blockers explicitly**

## Self-review

- Spec coverage: all nine acceptance criteria map to Tasks 1-8.
- Placeholder scan: no implementation placeholder is permitted; missing external credentials are explicit runtime gates, not deferred code.
- Type consistency: mobile config, release metadata kinds, and canonical origin are named consistently across tasks.
