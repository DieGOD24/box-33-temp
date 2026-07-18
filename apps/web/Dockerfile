# syntax=docker/dockerfile:1.7
# ─────────────────────────────────────────────────────────────────────────────
# Next.js web — multi-stage build
# Uses the Next.js standalone output (output: 'standalone' in next.config.ts)
# to produce a minimal runtime image.
# ─────────────────────────────────────────────────────────────────────────────

FROM node:22-alpine@sha256:16e22a550f3863206a3f701448c45f7912c6896a62de43add43bb9c86130c3e2 AS builder
WORKDIR /monorepo
RUN corepack enable pnpm

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY apps/web/package.json ./apps/web/
COPY packages/types/package.json ./packages/types/
COPY packages/typescript-config/package.json ./packages/typescript-config/

RUN pnpm install --frozen-lockfile

COPY apps/web ./apps/web
COPY packages/types ./packages/types
COPY packages/typescript-config ./packages/typescript-config

ARG API_URL=http://api:3001
ARG NEXT_PUBLIC_SITE_URL=http://localhost:3000
ARG NEXT_PUBLIC_SITE_NAME=BOX33
ARG NEXT_PUBLIC_DEFAULT_LOCALE=es
ENV API_URL=${API_URL}
ENV NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL}
ENV NEXT_PUBLIC_SITE_NAME=${NEXT_PUBLIC_SITE_NAME}
ENV NEXT_PUBLIC_DEFAULT_LOCALE=${NEXT_PUBLIC_DEFAULT_LOCALE}
RUN pnpm --filter @box33/web build

# ─────────────────────────────────────────────────────────────────────────────
FROM node:22-alpine@sha256:16e22a550f3863206a3f701448c45f7912c6896a62de43add43bb9c86130c3e2 AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN apk add --no-cache wget
RUN addgroup -S app && adduser -S -G app app

# Next.js standalone layout (pnpm monorepo → apps/web/server.js)
COPY --from=builder /monorepo/apps/web/.next/standalone ./
COPY --from=builder /monorepo/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /monorepo/apps/web/public ./apps/web/public

# Allow the non-root user to write the Next.js runtime caches
RUN mkdir -p /app/apps/web/.next/cache && chown -R app:app /app

USER app
EXPOSE 3000
# /api/health is a lightweight Next.js route that responds immediately
# without making any upstream API calls — safe to use before the API is up.
HEALTHCHECK --interval=15s --timeout=5s --start-period=30s --retries=5 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health
CMD ["node", "apps/web/server.js"]
