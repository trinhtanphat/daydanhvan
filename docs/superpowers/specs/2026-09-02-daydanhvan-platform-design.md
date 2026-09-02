# Dạy đánh vần Platform Design

**Date:** 2026-09-02
**Status:** Approved architecture captured for implementation

## 1. Goal

Build a production-oriented teacher discovery application inspired by the supplied mobile references, with an original visual implementation. The product lets parents/learners discover nearby reading/phonics teachers, filter and favorite profiles, view teacher details, and exchange realtime messages. The same backend serves a public web app and an iOS app.

## 2. Product Scope

### MVP user flows

1. Browse nearby teachers from the home screen.
2. Search by service area and approximate distance.
3. Filter by distance, age range, verification and sort order.
4. Open a teacher profile with biography, experience, skills and availability summary.
5. Favorite/unfavorite a teacher.
6. Open conversations and exchange realtime messages.
7. Manage learner/parent profile and device settings.
8. Teacher onboarding/profile editing and moderation-ready status fields.
9. Minimal admin surface for teacher approval and reports.

### Explicitly deferred

Payment, subscriptions, in-app video calls, AI matching and a marketplace booking engine are not part of the first release.

## 3. UX Direction

Use the supplied images only as layout/product references. Create original assets and components. Preserve the light pink, warm, approachable character while avoiding copied logos, portraits or proprietary artwork.

Primary tabs:

- Trang chủ
- Tìm kiếm
- Tin nhắn
- Yêu thích
- Tài khoản

Search includes a radar-style animated visualization with approximate distance labels. Teacher locations must not expose exact home coordinates.

## 4. Architecture

Use one GitHub monorepo with pnpm workspaces.

- `apps/web`: React + Vite + TypeScript web SPA.
- `apps/api`: Hono + TypeScript Cloudflare Worker API.
- `apps/mobile`: React Native TypeScript iOS application.
- `apps/admin`: lightweight React administration UI.
- `packages/contracts`: shared Zod request/response contracts.
- `packages/api-client`: typed web/mobile API client.
- `packages/design-tokens`: shared visual tokens.

Cloudflare is the production runtime:

- Workers Static Assets for the web/admin frontend output.
- Workers for the API.
- D1 for relational data.
- R2 for uploaded profile images.
- Durable Objects for realtime chat coordination.
- Queues may be added for async notification fan-out once push delivery is enabled.

The browser should use same-origin `/api/*` routing where practical. Mobile uses the public API hostname directly.

## 5. Data Model

Initial D1 tables:

- `users`
- `teacher_profiles`
- `teacher_service_areas`
- `teacher_availability`
- `favorites`
- `conversations`
- `conversation_members`
- `messages`
- `device_tokens`
- `reports`

Teacher service areas store intentionally approximate/public meeting coordinates or district-level centroids rather than private residential coordinates.

## 6. API Surface

Versioned API prefix: `/api/v1`.

Initial routes:

- `GET /health`
- `GET /teachers`
- `GET /teachers/:id`
- `POST /favorites/:teacherId`
- `DELETE /favorites/:teacherId`
- `GET /favorites`
- `GET /conversations`
- `GET /conversations/:id/messages`
- `POST /conversations/:id/messages`
- `GET /ws/conversations/:id` for realtime messaging

Authentication is designed behind an adapter boundary so local/demo identity can be replaced by production Apple/Google authentication without changing feature APIs.

## 7. Search and Privacy

Nearby discovery flow:

1. Receive user-provided or device-approved coordinates.
2. Query approximate service-area candidates.
3. Apply bounding filter.
4. Compute final distance server-side.
5. Return rounded distance values and public service-area metadata only.

Never return a teacher's private residential coordinate unless the teacher explicitly chooses a public meeting location.

## 8. Realtime Messaging

Use one Durable Object room per conversation. Durable Object responsibilities:

- Accept authenticated WebSocket connections.
- Broadcast new messages to current members.
- Persist message records to D1 through the API layer.
- Support hibernation-compatible WebSockets.

D1 remains the durable query source for conversation/message history.

## 9. CI/CD

### Pull request / push CI

- install dependencies
- lint
- typecheck
- unit tests
- API tests
- web build
- Worker dry-run/build
- iOS simulator build/test on a pinned macOS runner

### Cloudflare deployment

Production deployment uses Wrangler and Cloudflare bindings. GitHub Actions workflow expects a `CLOUDFLARE_API_TOKEN` repository/environment secret and uses account ID `6c5207813df3d5b83b9508125e0e9e12` as non-secret configuration.

If Cloudflare connector deployment is available in-session, deployment may also be executed directly after the same build/validation gates.

### iOS release

GitHub Actions owns iOS compilation. Unsigned simulator builds run in CI. Signed archive/TestFlight steps are enabled only when Apple signing/App Store Connect secrets are configured.

Required signed-release secrets:

- `APPLE_CERTIFICATE_P12_BASE64`
- `APPLE_CERTIFICATE_PASSWORD`
- `APPLE_PROVISIONING_PROFILE_BASE64`
- `APPSTORE_ISSUER_ID`
- `APPSTORE_KEY_ID`
- `APPSTORE_PRIVATE_KEY`

No signing material is committed to git.

## 10. Releases

Use semantic versioning starting at `v0.1.0`. A release workflow may create a tag/release only after CI passes. Production artifacts and deployment metadata must be associated with the exact commit SHA.

## 11. Testing and Acceptance

Release acceptance requires:

- TypeScript checks green.
- Unit/API tests green.
- Web production build succeeds.
- Worker build succeeds.
- `/api/v1/health` returns success.
- Primary web screens render on mobile viewport sizes.
- iOS simulator target compiles in GitHub Actions.
- No production secret is present in repository contents.

Live Cloudflare deployment and signed iOS distribution are separate gates that can be blocked only by missing account permissions/secrets; such a block must be reported explicitly rather than hidden.
