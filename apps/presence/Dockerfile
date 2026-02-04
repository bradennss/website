FROM node:lts-bullseye-slim AS base

RUN --mount=type=cache,target=/var/cache/apt,sharing=locked \
  apt-get -y update && \
  apt-get -y install libc6

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
RUN corepack install -g pnpm

RUN --mount=type=cache,id=pnpm,target=/pnpm/store,sharing=locked pnpm add --global turbo@^2

FROM base AS pruned

WORKDIR /app

COPY . .

RUN turbo prune presence --docker

FROM base AS builder

RUN --mount=type=cache,target=/var/cache/apt,sharing=locked \
  apt-get -y update && \
  apt-get -y install gcc g++ python3 make

WORKDIR /app

COPY --from=pruned /app/out/json/ .
RUN --mount=type=cache,id=pnpm,target=/pnpm/store,sharing=locked pnpm install --frozen-lockfile

COPY --from=pruned /app/out/full/ .
RUN pnpm build

FROM base AS runner

RUN --mount=type=cache,target=/var/cache/apt,sharing=locked \
  apt-get -y update && \
  apt-get -y install dumb-init

WORKDIR /app

COPY --from=builder /app .

WORKDIR /app/apps/presence

ENV NODE_ENV="production"

ENTRYPOINT [ "/usr/bin/dumb-init", "--" ]
CMD [ "node", "dist/main.js" ]
