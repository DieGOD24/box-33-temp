# syntax=docker/dockerfile:1.7
# ─────────────────────────────────────────────────────────────────────────────
# NestJS API — multi-stage build
# Stage 1: install deps + build (tsc via nest build)
# Stage 2: runtime — only prod node_modules + compiled dist
# ─────────────────────────────────────────────────────────────────────────────

FROM node:22-alpine@sha256:16e22a550f3863206a3f701448c45f7912c6896a62de43add43bb9c86130c3e2 AS builder
WORKDIR /monorepo

# argon2 needs native build tools on alpine.
RUN apk add --no-cache python3 make g++

RUN corepack enable pnpm

# Workspace manifests first (layer cache)
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/types/package.json ./packages/types/
COPY packages/typescript-config/package.json ./packages/typescript-config/

RUN pnpm install --frozen-lockfile

# Source
COPY apps/api/src ./apps/api/src
COPY apps/api/nest-cli.json apps/api/tsconfig.json apps/api/tsconfig.build.json ./apps/api/
COPY packages/types/src ./packages/types/src
COPY packages/types/tsconfig.json packages/types/tsconfig.build.json ./packages/types/
COPY packages/typescript-config ./packages/typescript-config

# Compile the shared types package to CommonJS JS so the compiled API can
# require() it at runtime (Node cannot strip TS types from node_modules).
# Repoint its package.json entry points to the built output (api image only).
RUN pnpm --filter @box33/types build
RUN node -e "const fs=require('fs');const f='./packages/types/package.json';const p=require(f);p.exports={'.':{types:'./dist/index.d.ts',default:'./dist/index.js'}};p.main='./dist/index.js';p.types='./dist/index.d.ts';fs.writeFileSync(f,JSON.stringify(p,null,2))"

RUN pnpm --filter @box33/api build

# Deploy standalone production node_modules. --legacy: pnpm v10 requires
# inject-workspace-packages otherwise; the classic behavior is what we want
# (workspace deps are compiled into dist / repointed above).
RUN pnpm deploy --legacy --filter @box33/api --prod /standalone/api

# ─────────────────────────────────────────────────────────────────────────────
FROM node:22-alpine@sha256:16e22a550f3863206a3f701448c45f7912c6896a62de43add43bb9c86130c3e2 AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN apk add --no-cache wget

# Non-root runtime user
RUN addgroup -S app && adduser -S -G app app
COPY --from=builder /standalone/api/node_modules ./node_modules
COPY --from=builder /monorepo/apps/api/dist ./dist
COPY --chmod=755 apps/api/docker-entrypoint.sh ./docker-entrypoint.sh

# Writable uploads dir for dashboard images (volume-mounted in compose)
RUN mkdir -p /app/data/uploads && chown -R app:app /app/data
USER app

EXPOSE 3001
# Liveness probe (process-only, never touches the DB) so a transient DB blip
# can't restart-loop the container. DB/schema readiness is /api/health/ready.
HEALTHCHECK --interval=10s --timeout=5s --start-period=40s --retries=5 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/api/health/live
# Entrypoint runs migrations once (advisory-locked) then execs the app.
ENTRYPOINT ["./docker-entrypoint.sh"]
