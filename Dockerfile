FROM node:22-bookworm-slim
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build && npm prune --omit=dev
ENV NODE_ENV=production PORT=3001 DATABASE_PATH=/app/data/inventory.db
RUN mkdir -p /app/data
EXPOSE 3001
CMD ["node", "server/index.js"]
