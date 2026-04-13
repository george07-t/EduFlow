#!/bin/bash
set -e

echo "⏳ Waiting for PostgreSQL..."
until python -c "
import psycopg2, os, sys
try:
    psycopg2.connect(os.environ['DATABASE_URL'])
    sys.exit(0)
except Exception as e:
    print(f'  Not ready: {e}')
    sys.exit(1)
" 2>/dev/null; do
    sleep 2
done
echo "✅ PostgreSQL is ready"

if [ "${RUN_SEED:-false}" = "true" ]; then
    echo "🔧 Running seed..."
    python seed.py
else
    echo "ℹ️ Skipping seed (RUN_SEED=false)"
fi

echo "🚀 Starting API server..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000
