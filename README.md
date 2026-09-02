# Dạy đánh vần

Monorepo for a privacy-aware teacher discovery experience with a Cloudflare Workers backend, responsive web app, and React Native iOS client.

## Apps

- `apps/web` — React + Vite web experience.
- `apps/api` — Hono API on Cloudflare Workers.
- `apps/mobile` — Expo/React Native iOS client.
- `apps/admin` — moderation surface.

## Platform

- Cloudflare Workers + Static Assets
- D1-ready relational schema
- R2-ready media boundary
- Durable Objects for realtime chat
- GitHub Actions for CI, Cloudflare deploy and iOS simulator builds

## Local development

```bash
corepack enable
pnpm install --no-frozen-lockfile
pnpm build:web
pnpm --filter @daydanhvan/api dev
```

The Worker serves `/api/v1/*` and the built SPA. `wrangler.jsonc` is configured for account `6c5207813df3d5b83b9508125e0e9e12` without embedding credentials.

## Cloudflare production deploy

Add `CLOUDFLARE_API_TOKEN` as a GitHub Actions repository/environment secret. The deploy workflow uses the fixed account ID above. D1 and R2 resource bindings can be enabled after provisioning using the provided migration/schema and typed Worker boundaries.

## iOS

GitHub Actions generates the iOS project from Expo configuration and runs an unsigned simulator build. Signed archive/TestFlight publishing remains gated by Apple signing secrets and is never stored in git.

## Release

The initial semantic release is `v0.1.0`.
