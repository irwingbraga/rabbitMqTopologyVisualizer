#!/bin/bash
set -e

cd "$(dirname "$0")"

if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install
fi

# Open browser after a short delay
(sleep 2 && open "http://localhost:5173") &

npm run dev
