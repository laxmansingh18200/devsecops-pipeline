# Stage 1: builder
FROM node:18-alpine3.21 AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci --production

COPY . .

# Stage 2: runtime (non-root)
FROM node:18-alpine3.21
RUN rm -rf /usr/local/lib/node_modules
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app
COPY --from=builder /app /app

USER appuser
ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "server.js"]
