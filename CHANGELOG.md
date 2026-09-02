# Dạy đánh vần v0.1.0

Initial platform release.

## Included

- Original responsive pink teacher-discovery web experience inspired by the supplied product references.
- Five primary user areas: Trang chủ, Tìm kiếm, Tin nhắn, Yêu thích and Tài khoản.
- Privacy-aware nearby teacher search that returns rounded distance without private residential coordinates.
- Cloudflare Worker API with Hono and versioned `/api/v1` routes.
- D1 relational schema plus seeded development/demo records for users, teachers, favorites, conversations and messages.
- R2-ready media binding and automated Cloudflare resource bootstrap when deployment credentials are available.
- Durable Object WebSocket room for realtime conversation fan-out.
- Protected moderation API and standalone admin static app.
- Expo/React Native iOS application using the same product language and API contract.
- GitHub Actions Linux CI, pinned macOS iOS simulator build, Cloudflare deployment and guarded semantic release automation.

## Security and release notes

No Cloudflare token, Apple signing certificate or private teacher coordinate is committed. Signed App Store/TestFlight delivery remains gated on Apple credentials. Cloudflare deployment is automatically skipped with an explicit warning when `CLOUDFLARE_API_TOKEN` is not configured in GitHub Actions secrets.
