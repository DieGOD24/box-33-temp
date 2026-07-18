#!/bin/sh
set -e
if [ "$DB_SYNCHRONIZE" = "true" ]; then
  echo "▶ DB_SYNCHRONIZE=true — skipping migrations (dev schema via synchronize)"
else
  echo "▶ Running database migrations…"
  node dist/database/migrate.js
fi
echo "▶ Starting API…"
exec node dist/main
