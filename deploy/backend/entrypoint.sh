#!/bin/sh
set -e

# The uploads_data volume may be owned by root from a previous root-running
# container. Fix ownership so the non-root appuser can write uploaded files.
chown -R appuser:appuser /app/uploads

# Drop privileges and run the server as appuser.
exec su-exec appuser "$@"
