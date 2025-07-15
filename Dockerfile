# Multi-stage build for PAI-NAI application
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm install --only=production

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build backend
WORKDIR /app/backend
RUN npm install
# Remove test files before build
RUN rm -rf src/prisma/test-*.ts src/prisma/run-all-tests.ts
RUN npm run build
RUN npm run db:generate

# Build frontend
WORKDIR /app/frontend
RUN npm install
# Fix TypeScript errors by removing unused variables
RUN sed -i 's/const user = useAuth();/const { user } = useAuth();/g' src/pages/Timesheets.tsx || true
RUN sed -i 's/const user = useAuth();/const { user } = useAuth();/g' src/pages/UserActivity.tsx || true
RUN sed -i 's/const user = useAuth();/const { user } = useAuth();/g' src/pages/UserActivityReport.tsx || true
RUN sed -i 's/const user = useAuth();/const { user } = useAuth();/g' src/pages/UserRoles.tsx || true
RUN sed -i 's/const user = useAuth();/const { user } = useAuth();/g' src/pages/Users.tsx || true
RUN npm run build

# Production image, copy all the files and run the app
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8000

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy backend
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/backend/node_modules ./backend/node_modules
COPY --from=builder /app/backend/package.json ./backend/package.json
COPY --from=builder /app/backend/prisma ./backend/prisma

# Copy frontend
COPY --from=builder /app/frontend/dist ./frontend/dist

# Copy scripts
COPY --from=builder /app/scripts ./scripts

# Set ownership
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1

# Start the application
CMD ["node", "backend/dist/index.js"] 