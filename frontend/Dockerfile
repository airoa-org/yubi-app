# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Build-time public env (Next.js embeds these at build time)
ARG NEXT_PUBLIC_API_BASE_URL
ARG NEXT_PUBLIC_API_TIMEOUT
ARG NEXT_PUBLIC_SENTRY_DSN
ARG NEXT_PUBLIC_SENTRY_ENVIRONMENT
ARG NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE
ARG NEXT_PUBLIC_ROBOT_SCOPE_URL

ENV NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL}
ENV NEXT_PUBLIC_API_TIMEOUT=${NEXT_PUBLIC_API_TIMEOUT}
ENV NEXT_PUBLIC_SENTRY_DSN=${NEXT_PUBLIC_SENTRY_DSN}
ENV NEXT_PUBLIC_SENTRY_ENVIRONMENT=${NEXT_PUBLIC_SENTRY_ENVIRONMENT}
ENV NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE=${NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE}
ENV NEXT_PUBLIC_ROBOT_SCOPE_URL=${NEXT_PUBLIC_ROBOT_SCOPE_URL}

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies (use BuildKit cache for faster rebuilds)
RUN --mount=type=cache,target=/root/.npm npm ci

# Copy source code
COPY . .

# Build Next.js app
RUN npm run build

# Production stage
FROM node:22-alpine AS runner

WORKDIR /app

# Set to production environment
ENV NODE_ENV=production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy necessary files from builder
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Start the application
CMD ["node", "server.js"]
