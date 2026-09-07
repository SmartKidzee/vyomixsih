#!/bin/sh
set -e

echo "[frontend] Running bun install (using cache)..."
bun install

echo "[frontend] Starting Vite dev server..."
exec bun run dev --host 0.0.0.0

