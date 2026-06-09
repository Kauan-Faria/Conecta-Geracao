#!/bin/sh
set -e

echo "Applying database migrations..."
pnpm exec prisma migrate deploy

echo "Seeding knowledge base (idempotent)..."
pnpm exec prisma db seed

echo "Starting API on port ${PORT:-3000}..."
exec node dist/main.js
