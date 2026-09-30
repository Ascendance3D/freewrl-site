#!/usr/bin/env bash
# (Re)start a local-only wrangler dev server on 127.0.0.1:8788 serving ./dist.
# Never deploys. The stale CLOUDFLARE_* env is removed so nothing remote is used.
# Restart after every build: wrangler dev keeps a stale asset list otherwise.
cd "$(dirname "$0")/.."
PIDFILE=/tmp/freewrl-wrangler-dev.pgid
if [ -f "$PIDFILE" ]; then kill -- "-$(cat "$PIDFILE")" 2>/dev/null; sleep 1; fi
setsid env -u CLOUDFLARE_API_TOKEN -u CLOUDFLARE_ACCOUNT_ID npx wrangler dev --local --port 8788 --ip 127.0.0.1 \
  --show-interactive-dev-session=false > /tmp/freewrl-wrangler-dev.log 2>&1 < /dev/null &
echo $! > "$PIDFILE"
for i in $(seq 1 60); do curl -sf -o /dev/null http://127.0.0.1:8788/ && { echo "serving http://127.0.0.1:8788"; exit 0; }; sleep 0.5; done
echo "server did not start; see /tmp/freewrl-wrangler-dev.log"; exit 1
