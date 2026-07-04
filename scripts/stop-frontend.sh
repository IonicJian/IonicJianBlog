#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PORT="${1:-5173}"
PID_FILE="$ROOT_DIR/logs/frontend-$PORT.pid"

if [[ ! -f "$PID_FILE" ]]; then
  echo "no frontend pid file for port $PORT"
  exit 0
fi

PID="$(cat "$PID_FILE")"
if kill -0 "$PID" 2>/dev/null; then
  kill "$PID"
  echo "frontend stopped (pid $PID)"
else
  echo "frontend was not running (pid $PID)"
fi
rm -f "$PID_FILE"
