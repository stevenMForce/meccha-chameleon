FROM node:22-alpine AS builder
WORKDIR /app
COPY package.json turbo.json tsconfig.base.json ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/server/package.json ./apps/server/
RUN npm install --workspace=@meccha/shared --workspace=@meccha/server
COPY packages/shared ./packages/shared
COPY apps/server ./apps/server
RUN npm run build --workspace=@meccha/shared
RUN npm run build --workspace=@meccha/server

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/shared ./packages/shared
COPY --from=builder /app/apps/server ./apps/server
EXPOSE 2567
CMD ["node", "apps/server/dist/index.js"]
