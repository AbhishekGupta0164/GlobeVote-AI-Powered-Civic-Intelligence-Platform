FROM node:20-slim AS base

# Install pnpm
RUN npm install -g pnpm@9

WORKDIR /app

# ── Install dependencies ───────────────────────────────────────────────────
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json tsconfig.json .npmrc ./
COPY lib/api-spec/package.json              lib/api-spec/
COPY lib/api-zod/package.json               lib/api-zod/
COPY lib/api-client-react/package.json      lib/api-client-react/
COPY lib/db/package.json                    lib/db/
COPY lib/integrations-openai-ai-server/package.json lib/integrations-openai-ai-server/
COPY lib/integrations-openai-ai-react/package.json  lib/integrations-openai-ai-react/
COPY artifacts/api-server/package.json      artifacts/api-server/
COPY artifacts/globevote/package.json       artifacts/globevote/
COPY scripts/package.json                   scripts/

RUN pnpm install --no-frozen-lockfile

# ── Copy full source ───────────────────────────────────────────────────────
COPY . .

# ── Build shared libraries ─────────────────────────────────────────────────
RUN pnpm run typecheck:libs 2>/dev/null || true

# ── Build React frontend ───────────────────────────────────────────────────
# BASE_PATH=/ means the app is served at the root of the domain
RUN BASE_PATH=/ PORT=7860 NODE_ENV=production \
    pnpm --filter @workspace/globevote run build

# ── Build Express API server ───────────────────────────────────────────────
RUN pnpm --filter @workspace/api-server run build

# ── Copy PGlite WASM/data assets alongside the bundle ─────────────────────
# PGlite resolves postgres.data and postgres.wasm relative to import.meta.url
# (the bundle file), so they must be co-located in the dist directory.
RUN PGLITE_DIST=$(find /app/node_modules -path "*/@electric-sql/pglite/dist" -type d | head -1) && \
    cp "$PGLITE_DIST/postgres.data" /app/artifacts/api-server/dist/ && \
    cp "$PGLITE_DIST/postgres.wasm" /app/artifacts/api-server/dist/

# ── Production image ───────────────────────────────────────────────────────
FROM node:20-slim AS runner

RUN npm install -g pnpm@9

WORKDIR /app

# Copy built artifacts
COPY --from=base /app/artifacts/api-server/dist        ./artifacts/api-server/dist
COPY --from=base /app/artifacts/globevote/dist/public  ./frontend/public

# Copy node_modules needed at runtime
COPY --from=base /app/node_modules            ./node_modules
COPY --from=base /app/lib                     ./lib
COPY --from=base /app/package.json            ./package.json
COPY --from=base /app/pnpm-workspace.yaml     ./pnpm-workspace.yaml

# HF Spaces requires port 7860
EXPOSE 7860

ENV PORT=7860
ENV NODE_ENV=production
ENV STATIC_FILES_PATH=/app/frontend/public

# Required — set these as Secrets in your HF Space:
# DATABASE_URL        → your connection string
# OPENAI_API_KEY      → your OpenAI API key
# SESSION_SECRET      → any long random string

CMD ["node", "--enable-source-maps", "artifacts/api-server/dist/index.mjs"]
