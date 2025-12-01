#!/bin/sh
set -e

echo "[entrypoint] Installing Prisma Client..."
cd /app && npm install @prisma/client

echo "[entrypoint] Generating Prisma Client..."
cd /app && node_modules/.bin/prisma generate --schema=./prisma/schema.prisma

echo "[entrypoint] Waiting for database to be ready..."
# Esperar hasta 30 segundos a que la BD esté lista
max_attempts=30
attempt=1
until node_modules/.bin/prisma db execute --stdin <<< "SELECT 1" > /dev/null 2>&1 || [ $attempt -eq $max_attempts ]; do
  echo "[entrypoint] Database not ready yet, waiting... (attempt $attempt/$max_attempts)"
  sleep 1
  attempt=$((attempt + 1))
done

if [ $attempt -eq $max_attempts ]; then
  echo "[entrypoint] ⚠️  Database connection timeout after ${max_attempts}s, but continuing..."
fi

echo "[entrypoint] Running prisma migrate deploy..."
if node_modules/.bin/prisma migrate deploy; then
  echo "[entrypoint] ✅ Migrations deployed successfully"
else
  echo "[entrypoint] ⚠️  Migration deployment failed, but continuing..."
fi

echo "[entrypoint] Finished. Executing command: $@"
exec "$@"
