# Base node image
FROM node:20-alpine AS base

WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED 1

# Install dependencies
FROM base AS deps
RUN apk add --no-cache libc6-compat
RUN corepack enable && corepack prepare pnpm@latest --activate
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile

# Build app
FROM base AS builder
WORKDIR /app

# Accept and expose build-time args as env vars
ARG DATABASE_URL
ARG AUTH_SECRET
ENV DATABASE_URL=${DATABASE_URL}
ENV AUTH_SECRET=${AUTH_SECRET}

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN pnpm build


# Production runtime
FROM base AS runner
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

WORKDIR /app
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
#COPY --from=builder /app/.env .env

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
