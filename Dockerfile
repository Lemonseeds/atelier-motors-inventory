# Stage 1: Build client assets and install dependencies
FROM node:22-bookworm-slim AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build && npm prune --omit=dev

# Stage 2: Minimal production runtime image
FROM node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production PORT=3001 DATABASE_PATH=/app/data/inventory.db

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server
COPY --from=builder /app/client ./client
COPY --from=builder /app/docs ./docs

RUN mkdir -p /app/data

EXPOSE 3001
CMD ["node", "server/index.js"]

