FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
# кэш npm между сборками + повторы: сеть до registry.npmjs.org бывает нестабильной
RUN --mount=type=cache,target=/root/.npm npm ci --no-audit --no-fund --fetch-retries=5 --fetch-retry-mintimeout=20000 --fetch-retry-maxtimeout=120000
COPY . .
RUN npm run build && npm prune --omit=dev

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package*.json ./
CMD ["node", "dist/main"]
