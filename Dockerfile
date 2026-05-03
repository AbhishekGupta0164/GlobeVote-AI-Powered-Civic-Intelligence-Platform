# Read the doc: https://huggingface.co/docs/hub/spaces-sdks-docker
# Node.js 20 is required for this project
FROM node:20-slim

# Install system dependencies, including ffmpeg for audio features
RUN apt-get update && apt-get install -y ffmpeg && rm -rf /var/lib/apt/lists/*

# Set environment variables
ENV PORT=7860

# Install pnpm globally
RUN npm install -g pnpm@10.28.0

# Set up the working directory and user
WORKDIR /app
RUN chown node:node /app
USER node

# Copy configuration files first for better caching
COPY --chown=node:node package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./

# Copy all workspaces
COPY --chown=node:node artifacts ./artifacts
COPY --chown=node:node lib ./lib
COPY --chown=node:node scripts ./scripts

# Install dependencies (skipping dev dependencies)
RUN pnpm install --frozen-lockfile

# Build the application (typecheck + build both frontend and backend)
RUN pnpm run build

# Expose the Hugging Face space port
EXPOSE 7860

ENV NODE_ENV=production

# Start the API server which now also serves the frontend
CMD ["pnpm", "--filter", "@workspace/api-server", "run", "start"]
