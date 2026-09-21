FROM node:24.21.0-trixie-slim AS build-base

RUN npm install --global pnpm@12.5.1 turbo@2.11.2

FROM build-base AS pruned

WORKDIR /app

COPY . .

RUN turbo prune web --docker

FROM build-base AS builder

WORKDIR /app

COPY --from=pruned /app/out/json/ .
COPY --from=pruned /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN --mount=type=cache,id=pnpm,target=/pnpm/store,sharing=locked \
  pnpm install --frozen-lockfile

COPY --from=pruned /app/out/full/ .
COPY turbo.json turbo.json

RUN pnpm turbo run build --filter=web...

FROM node:24.21.0-trixie-slim AS runner

RUN --mount=type=cache,target=/var/cache/apt,sharing=locked \
  apt-get -y update && \
  apt-get -y install dumb-init

WORKDIR /app

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static

ENTRYPOINT [ "/usr/bin/dumb-init", "--" ]
CMD ["node", "apps/web/server.js"]
