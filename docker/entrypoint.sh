#!/bin/sh
set -e

echo "[entrypoint] Installing Prisma Client..."
cd /app && npm install @prisma/client

echo "[entrypoint] Generating Prisma Client..."
cd /app && node_modules/.bin/prisma generate --schema=./prisma/schema.prisma

echo "[entrypoint] Running prisma migrate deploy..."
# try to deploy migrations; if it fails (DB not ready) the container can be restarted by docker-compose
node_modules/.bin/prisma migrate deploy || true

echo "[entrypoint] Finished. Executing command: $@"
exec "$@"
