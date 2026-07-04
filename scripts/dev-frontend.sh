#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PORT="${1:-5173}"
LOG_DIR="$ROOT_DIR/logs"
PID_FILE="$LOG_DIR/frontend-$PORT.pid"
LOG_FILE="$LOG_DIR/frontend-$PORT.log"

mkdir -p "$LOG_DIR"
cd "$ROOT_DIR/frontend"

if [[ -f "$PID_FILE" ]] && kill -0 "$(cat "$PID_FILE")" 2>/dev/null; then
  echo "frontend already running on port $PORT (pid $(cat "$PID_FILE"))"
  exit 0
fi

nohup npx vite --port "$PORT" --host 127.0.0.1 > "$LOG_FILE" 2>&1 &
echo $! > "$PID_FILE"
echo "frontend started on http://127.0.0.1:$PORT (pid $!, log $LOG_FILE)"
