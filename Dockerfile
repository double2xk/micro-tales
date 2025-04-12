# Base Node.js Alpine image for smaller size
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy package.json and related files
COPY package.json pnpm-lock.yaml* ./

# Install dependencies (no need for native module support now)
RUN pnpm install --frozen-lockfile

# Build the application
FROM base AS builder
WORKDIR /app

# Install pnpm in this stage too
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Create a temporary .env file for build
RUN echo "DATABASE_URL=postgresql://postgres:password@localhost:5432/micro-tales-app" > .env
RUN echo "AUTH_SECRET=temporary-secret-for-build-only" >> .env

# Set environment variables for building
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Build the application
RUN pnpm build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

# Set environment variables
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application files
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Try to copy configuration files if they exist
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/package.json ./

# Set user to non-root
USER nextjs

# Expose port
EXPOSE 3000

# Set proper environment variables
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Start the application
CMD ["node", "server.js"]