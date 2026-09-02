# Dạy đánh vần v0.1.0 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the first working monorepo release with a Cloudflare Worker API/static web app, D1-ready schema, realtime chat room implementation, React Native iOS client, CI, deployment workflow and semantic release automation.

**Architecture:** A pnpm workspace contains web, API and mobile packages. The Cloudflare Worker handles `/api/v1/*` and serves the built Vite SPA through Workers Static Assets. D1/R2/Durable Object bindings are represented by typed interfaces and deployment configuration; demo fallback data keeps the first build usable before remote resources are provisioned.

**Tech Stack:** React 19, Vite 7, TypeScript 5.9, Hono 4, Zod 4, Cloudflare Workers/Wrangler 4, React Native via Expo, Vitest, GitHub Actions.

**Spec:** `docs/superpowers/specs/2026-09-02-daydanhvan-platform-design.md`

## Global Constraints

- Repository: `trinhtanphat/daydanhvan`.
- Cloudflare account ID: `6c5207813df3d5b83b9508125e0e9e12`.
- Production runtime: Cloudflare Workers and Workers Static Assets.
- API prefix: `/api/v1`.
- Initial release tag: `v0.1.0`.
- No secrets, Apple certificates, provisioning profiles, private residential teacher coordinates, copied portraits or proprietary artwork may be committed.
- iOS compilation is executed by GitHub Actions on a pinned macOS runner.

---

### Task 1: Monorepo foundation and shared contracts

**Files:**
- Create: `package.json`, `pnpm-workspace.yaml`, `tsconfig.base.json`, `.gitignore`, `README.md`
- Create: `packages/contracts/package.json`, `packages/contracts/src/index.ts`
- Create: `packages/design-tokens/package.json`, `packages/design-tokens/src/index.ts`

**Interfaces:**
- Produces `Teacher`, `TeacherListResponse`, `HealthResponse`, `Message`, `Conversation` Zod schemas/types.
- Produces shared design token exports used by web/mobile.

- [ ] **Step 1: Define contracts with tests embedded in package typecheck surface**

Create schemas that parse teacher cards containing `id`, `name`, `age`, `distanceKm`, `verified`, `specialty`, `district`, `avatarUrl`, `online` and optional `rating`.

- [ ] **Step 2: Configure workspace scripts**

Root scripts must include `typecheck`, `test`, `build`, `build:web`, `build:worker` and `lint`.

- [ ] **Step 3: Verify workspace metadata**

Run: `corepack pnpm --version && corepack pnpm install --no-frozen-lockfile`
Expected: dependency installation succeeds.

- [ ] **Step 4: Commit**

```bash
git add package.json pnpm-workspace.yaml tsconfig.base.json .gitignore README.md packages
git commit -m "chore: initialize daydanhvan monorepo"
```

### Task 2: Worker API, privacy-aware discovery and D1 schema

**Files:**
- Create: `apps/api/package.json`, `apps/api/tsconfig.json`
- Create: `apps/api/src/index.ts`, `apps/api/src/demo-data.ts`, `apps/api/src/distance.ts`, `apps/api/src/chat-room.ts`
- Create: `apps/api/test/api.test.ts`, `apps/api/test/distance.test.ts`
- Create: `migrations/0001_initial.sql`
- Create: `wrangler.jsonc`

**Interfaces:**
- Consumes shared contracts.
- Produces Worker fetch handler and `ChatRoom` Durable Object export.
- `GET /api/v1/health` returns `{ ok: true, service: "daydanhvan-api", version: "0.1.0" }`.
- `GET /api/v1/teachers` accepts optional `lat`, `lng`, `maxDistanceKm` and returns rounded public distance only.

- [ ] **Step 1: Write failing distance tests**

```ts
expect(roundDistanceKm(0.64)).toBe(0.6)
expect(haversineKm(21.0285, 105.8048, 21.0300, 105.8100)).toBeGreaterThan(0)
```

- [ ] **Step 2: Run tests and confirm failure**

Run: `corepack pnpm --filter @daydanhvan/api test`
Expected: FAIL before implementation.

- [ ] **Step 3: Implement API and demo fallback**

Return six original demo teacher records with non-identifying generated avatar URLs/initial placeholders. Persist favorites/messages to D1 only when `env.DB` is bound; otherwise provide deterministic demo responses.

- [ ] **Step 4: Implement chat Durable Object**

Accept WebSocket upgrades for `/api/v1/ws/conversations/:id`; use Hibernation-compatible WebSocket acceptance and broadcast text payloads to connected clients.

- [ ] **Step 5: Add SQL migration**

Create `users`, `teacher_profiles`, `teacher_service_areas`, `teacher_availability`, `favorites`, `conversations`, `conversation_members`, `messages`, `device_tokens`, `reports` with indexes on teacher status, service area district and message conversation/time.

- [ ] **Step 6: Run tests**

Run: `corepack pnpm --filter @daydanhvan/api test && corepack pnpm --filter @daydanhvan/api typecheck`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add apps/api migrations wrangler.jsonc
git commit -m "feat: add Cloudflare Worker API and data model"
```

### Task 3: Web app matching the supplied product direction

**Files:**
- Create: `apps/web/package.json`, `apps/web/tsconfig.json`, `apps/web/vite.config.ts`, `apps/web/index.html`
- Create: `apps/web/src/main.tsx`, `apps/web/src/App.tsx`, `apps/web/src/styles.css`
- Create: `apps/web/src/components/TeacherCard.tsx`, `apps/web/src/components/RadarSearch.tsx`, `apps/web/src/components/BottomNav.tsx`
- Create: `apps/web/src/lib/api.ts`, `apps/web/src/test/App.test.tsx`

**Interfaces:**
- Consumes `GET /api/v1/teachers` and shared `Teacher` type.
- Produces five tab screens: home, search, messages, favorites, account.

- [ ] **Step 1: Write render test**

Test that the app renders `Dạy đánh vần`, `Tìm cô giáo gần bạn`, the five navigation labels and at least one teacher card when API data is mocked.

- [ ] **Step 2: Run test and confirm failure**

Run: `corepack pnpm --filter @daydanhvan/web test`
Expected: FAIL before UI implementation.

- [ ] **Step 3: Implement responsive UI**

Use original CSS: white/pink palette, rounded teacher cards, soft gradients, sticky mobile bottom navigation and a CSS radar with concentric rings. Do not embed the supplied screenshots or portraits.

- [ ] **Step 4: Implement API loading/fallback**

Fetch `/api/v1/teachers`; show a compact error state and retry control on network errors.

- [ ] **Step 5: Verify**

Run: `corepack pnpm --filter @daydanhvan/web test && corepack pnpm --filter @daydanhvan/web build`
Expected: PASS and `apps/web/dist` created.

- [ ] **Step 6: Commit**

```bash
git add apps/web
git commit -m "feat: build teacher discovery web experience"
```

### Task 4: React Native iOS client

**Files:**
- Create: `apps/mobile/package.json`, `apps/mobile/app.json`, `apps/mobile/tsconfig.json`, `apps/mobile/index.ts`
- Create: `apps/mobile/App.tsx`, `apps/mobile/src/theme.ts`, `apps/mobile/src/api.ts`

**Interfaces:**
- Consumes the same teacher list API and shared visual language.
- Produces an Expo/React Native iOS app named `Dạy đánh vần` with bundle identifier `site.qs3d.daydanhvan`.

- [ ] **Step 1: Add mobile package and type-safe API mapping**

Create a React Native screen with header, location selector, teacher cards and five-tab bottom navigation.

- [ ] **Step 2: Verify TypeScript**

Run: `corepack pnpm --filter @daydanhvan/mobile typecheck`
Expected: PASS.

- [ ] **Step 3: Verify iOS project generation**

Run on macOS CI: `corepack pnpm --filter @daydanhvan/mobile exec expo prebuild --platform ios --non-interactive --clean`
Expected: generated `ios/` workspace/project.

- [ ] **Step 4: Commit**

```bash
git add apps/mobile
git commit -m "feat: add React Native iOS client"
```

### Task 5: CI, iOS build and Cloudflare deployment workflows

**Files:**
- Create: `.github/workflows/ci.yml`
- Create: `.github/workflows/ios.yml`
- Create: `.github/workflows/deploy-cloudflare.yml`

**Interfaces:**
- `ci.yml`: Linux JS checks/build.
- `ios.yml`: pinned macOS simulator build; signed archive only if Apple secrets exist.
- `deploy-cloudflare.yml`: deploy after main CI using `CLOUDFLARE_API_TOKEN` and fixed account ID.

- [ ] **Step 1: Configure CI**

Use Node 22, Corepack and pnpm. Run typecheck, tests and web build.

- [ ] **Step 2: Configure iOS build**

Use `macos-15`, generate iOS native project, run CocoaPods and `xcodebuild` against an iPhone Simulator destination with signing disabled.

- [ ] **Step 3: Configure Cloudflare deploy**

Use Wrangler with `CLOUDFLARE_ACCOUNT_ID=6c5207813df3d5b83b9508125e0e9e12` and repository secret `CLOUDFLARE_API_TOKEN`. Build web before deploy.

- [ ] **Step 4: Commit**

```bash
git add .github/workflows
git commit -m "ci: add web worker and iOS pipelines"
```

### Task 6: Release automation for v0.1.0

**Files:**
- Create: `.github/workflows/release.yml`
- Create: `CHANGELOG.md`

**Interfaces:**
- On a successful push to `main`, release workflow checks package version `0.1.0`, creates `v0.1.0` if absent, and creates a GitHub Release using `gh` with `GITHUB_TOKEN`.

- [ ] **Step 1: Add guarded tag creation**

The workflow must execute `git ls-remote --tags origin refs/tags/v0.1.0`; if present, exit successfully without recreating the release.

- [ ] **Step 2: Add changelog**

Document web teacher discovery, API, privacy-aware distance, D1 schema, Durable Object chat, iOS client and CI/CD.

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/release.yml CHANGELOG.md
git commit -m "release: prepare v0.1.0"
```

### Task 7: Verification and deployment gate

**Files:** no new feature files.

- [ ] **Step 1: Verify repository status and secret scan**

Run: `git grep -nE "(BEGIN PRIVATE KEY|APPLE_CERTIFICATE|CLOUDFLARE_API_TOKEN=)" -- ':!docs/**' || true`
Expected: no committed secret values.

- [ ] **Step 2: Run complete JavaScript verification**

Run: `corepack pnpm install --no-frozen-lockfile && corepack pnpm typecheck && corepack pnpm test && corepack pnpm build`
Expected: PASS.

- [ ] **Step 3: Observe GitHub Actions**

Require green Linux CI and iOS simulator compilation before calling v0.1.0 complete.

- [ ] **Step 4: Observe Cloudflare deploy**

If `CLOUDFLARE_API_TOKEN` is configured, require successful Wrangler deploy and `/api/v1/health` response. If unavailable, report the deployment as blocked rather than claiming success.

- [ ] **Step 5: Verify tag/release**

Require `refs/tags/v0.1.0` and GitHub Release `v0.1.0` to point to the verified main commit.
