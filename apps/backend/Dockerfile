# Build a partir da raiz do monorepo (pnpm workspace)
FROM node:22-alpine AS base

RUN apk add --no-cache openssl

RUN corepack enable && corepack prepare pnpm@9 --activate

WORKDIR /app

FROM base AS deps

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./

COPY apps/backend/package.json ./apps/backend/

RUN pnpm install --frozen-lockfile --filter @conecta-geracao/api

FROM base AS builder

COPY --from=deps /app/node_modules ./node_modules

COPY --from=deps /app/apps/backend/node_modules ./apps/backend/node_modules

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./

COPY apps/backend ./apps/backend

WORKDIR /app/apps/backend

# prisma.config.ts exige DATABASE_URL/DIRECT_URL ao carregar (valores dummy só no build)
ENV DATABASE_URL="postgresql://build:build@localhost:5432/build"
ENV DIRECT_URL="postgresql://build:build@localhost:5432/build"

RUN pnpm prisma generate

RUN pnpm build

FROM base AS runner

ENV NODE_ENV=production

WORKDIR /app/apps/backend

COPY --from=builder /app/apps/backend/dist ./dist

COPY --from=builder /app/apps/backend/prisma ./prisma

COPY --from=builder /app/apps/backend/src ./src

COPY --from=builder /app/apps/backend/prisma.config.ts ./

COPY --from=builder /app/apps/backend/tsconfig.json ./

COPY --from=builder /app/apps/backend/package.json ./

COPY --from=builder /app/node_modules /app/node_modules

COPY --from=builder /app/apps/backend/node_modules ./node_modules

COPY apps/backend/docker-entrypoint.sh ./docker-entrypoint.sh

RUN sed -i 's/\r$//' docker-entrypoint.sh && chmod +x docker-entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["./docker-entrypoint.sh"]
