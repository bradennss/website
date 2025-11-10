FROM node:lts-bullseye-slim AS base

FROM base AS builder

RUN --mount=type=cache,target=/var/cache/apt,sharing=locked \
  apt-get -y update && \
  apt-get -y install gcc g++

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
RUN corepack install -g pnpm

RUN --mount=type=cache,id=pnpm,target=/pnpm/store,sharing=locked \
  pnpm add --global turbo@^2

WORKDIR /app

COPY . .

RUN --mount=type=cache,id=pnpm,target=/pnpm/store,sharing=locked \
  pnpm install --frozen-lockfile

WORKDIR /app/apps/web

RUN pnpm build

FROM base AS runner

RUN --mount=type=cache,target=/var/cache/apt,sharing=locked \
  apt-get -y update && \
  apt-get -y install dumb-init

WORKDIR /app

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
# COPY --from=installer --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public

ENTRYPOINT [ "/usr/bin/dumb-init", "--" ]
CMD ["node", "apps/web/server.js"]
