FROM node:24.21.0-trixie-slim AS build-base

RUN npm install --global pnpm@12.5.1 turbo@2.11.2

FROM build-base AS pruned

WORKDIR /app

COPY . .

RUN turbo prune presence --docker

FROM build-base AS builder

WORKDIR /app

COPY --from=pruned /app/out/json/ .
COPY --from=pruned /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN --mount=type=cache,id=pnpm,target=/pnpm/store,sharing=locked \
  pnpm install --frozen-lockfile

COPY --from=pruned /app/out/full/ .
COPY turbo.json turbo.json

RUN pnpm turbo run build --filter=presence...
RUN find . -type d -name node_modules -prune -exec rm -rf '{}' +
RUN --mount=type=cache,id=pnpm,target=/pnpm/store,sharing=locked \
  pnpm install --frozen-lockfile --prod

FROM node:24.21.0-trixie-slim AS runner

RUN --mount=type=cache,target=/var/cache/apt,sharing=locked \
  apt-get -y update && \
  apt-get -y install dumb-init

WORKDIR /app

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 presence

COPY --from=builder --chown=presence:nodejs /app .

WORKDIR /app/apps/presence

ENV NODE_ENV="production"

USER presence

ENTRYPOINT [ "/usr/bin/dumb-init", "--" ]
CMD [ "node", "dist/main.js" ]
