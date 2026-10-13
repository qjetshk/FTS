#!/bin/sh
# Dev-старт контейнера. node_modules лежит в docker volume, а не на Windows-диске:
# чтение десятков тысяч файлов через 9p (WSL2 ↔ C:\) растягивало старт до 5–10 минут.
# Зависимости ставим сами, когда меняется package-lock.json; prisma client — когда меняется схема.
set -e

hash() { md5sum "$1" | cut -d' ' -f1; }

LOCK_HASH=$(hash package-lock.json)
if [ "$(cat node_modules/.lock-hash 2>/dev/null)" != "$LOCK_HASH" ]; then
  echo "[dev-entrypoint] package-lock.json изменился — npm install"
  # install, а не ci: ci удаляет саму папку node_modules, а это точка монтирования volume
  npm install --no-audit --no-fund
  echo "$LOCK_HASH" > node_modules/.lock-hash
fi

if [ -f prisma/schema.prisma ]; then
  SCHEMA_HASH=$(hash prisma/schema.prisma)
  if [ "$(cat node_modules/.schema-hash 2>/dev/null)" != "$SCHEMA_HASH" ]; then
    echo "[dev-entrypoint] schema.prisma изменилась — prisma generate"
    npx prisma generate
    echo "$SCHEMA_HASH" > node_modules/.schema-hash
  fi
fi

exec "$@"
