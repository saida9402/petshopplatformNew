# ══════════════════════════════════════════════════════════════════════════════
# Stage 1 — Builder
# Installs all dependencies (including devDeps) and compiles both apps.
# The full monorepo must be built here because petoria-batch imports types
# from petoria-api source paths.
# ══════════════════════════════════════════════════════════════════════════════
FROM node:20-alpine AS builder

WORKDIR /app

# Copy manifests first so Docker layer-caches the install step.
# Reinstall only when package*.json changes.
COPY package*.json ./
RUN npm ci

# Copy full source tree and compile
COPY . .
RUN npm run build


# ══════════════════════════════════════════════════════════════════════════════
# Stage 2 — Production (petoria-api)
# Lean image: production deps only, non-root user, no source files.
# ══════════════════════════════════════════════════════════════════════════════
FROM node:20-alpine AS production

WORKDIR /app

# Create a dedicated non-root system user before any file operations
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Install only production dependencies, then wipe the npm cache from the layer
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy the compiled output from the builder stage
COPY --from=builder /app/dist ./dist

# Pre-create upload directories with correct ownership.
# These are overridden by the named Docker volume at runtime, but the
# directories must exist in the image for the first-start case.
RUN mkdir -p uploads/member uploads/product uploads/article \
    && chown -R appuser:appgroup /app

USER appuser

EXPOSE 3002

# Health check: the root GET / endpoint returns 200 from AppController.
# Uses Node's built-in http module — no additional binary required.
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD node -e " \
        const http = require('http'); \
        http.get('http://localhost:3002', (r) => process.exit(r.statusCode < 500 ? 0 : 1)) \
            .on('error', () => process.exit(1)); \
    "

CMD ["node", "dist/apps/petoria-api/main"]
