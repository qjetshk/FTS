# Прод-образ бэка. node_modules оставляем полные: prisma CLI (миграции на старте) и ts-node (seed:tnved) — devDependencies
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --no-audit --no-fund
COPY . .
# generate не ходит в БД, но prisma.config требует DATABASE_URL — подставляем заглушку только на шаг сборки
RUN DATABASE_URL=postgresql://build:build@localhost:5432/build npx prisma generate && npm run build

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY package*.json prisma.config.ts tsconfig.json ./
EXPOSE 4200
# миграции до старта: новая схема применяется вместе с выкаткой кода
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/src/main"]
