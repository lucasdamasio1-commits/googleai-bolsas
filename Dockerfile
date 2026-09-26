# Production Dockerfile for Cadê Bolsa (www.cadebolsa.com.br)
FROM node:22-alpine AS builder

WORKDIR /app

# Install all dependencies (using npm install for resilience)
COPY package*.json ./
RUN npm install

# Copy source code and build client
COPY . .
RUN npm run build

# Production Runner Stage
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Install production dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy built frontend assets and server files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.ts ./server.ts
COPY --from=builder /app/src ./src

EXPOSE 3000

CMD ["npx", "tsx", "server.ts"]
