#!/bin/sh
set -e

echo "[D-Vault Backend] Applying Prisma migrations..."
npx prisma migrate deploy

echo "[D-Vault Backend] Launching application..."
exec "$@"
