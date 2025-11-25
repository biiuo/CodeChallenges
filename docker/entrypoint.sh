#!/bin/sh
set -e

echo "[entrypoint] Running prisma generate..."
npx prisma generate

echo "[entrypoint] Running prisma migrate deploy..."
# try to deploy migrations; if it fails (DB not ready) the container can be restarted by docker-compose
npx prisma migrate deploy || true

echo "[entrypoint] Finished. Executing command: $@"
exec "$@"
