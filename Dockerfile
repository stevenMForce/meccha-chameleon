FROM node:22-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json turbo.json tsconfig.base.json ./
COPY packages/shared ./packages/shared
COPY apps/server ./apps/server
RUN npm ci --workspace=@meccha/shared --workspace=@meccha/server 2>/dev/null || npm install --workspace=@meccha/shared --workspace=@meccha/server
RUN npm run build --workspace=@meccha/shared && npm run build --workspace=@meccha/server

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/package.json /app/package-lock.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/shared ./packages/shared
COPY --from=builder /app/apps/server ./apps/server
EXPOSE 2567
HEALTHCHECK CMD wget -qO- http://localhost:2567/health || exit 1
CMD ["node", "apps/server/dist/index.js"]
