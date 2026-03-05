#!/bin/bash
set -e

cd "$(dirname "$0")"

if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install
fi

# Open browser after a short delay (Vite opens on 5173)
(sleep 3 && open "http://localhost:5173") &

npm run dev
