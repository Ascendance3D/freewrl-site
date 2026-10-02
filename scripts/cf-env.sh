#!/usr/bin/env bash
# Run one command with the FreeWRL Cloudflare account token from .env.local.
# Any CLOUDFLARE_* already in the environment (e.g. a stale shell export) is replaced,
# the token is checked at /accounts/<id>/tokens/verify, then the command runs.
# Never prints the token. Only the command's own process sees it.
#
#   scripts/cf-env.sh npx wrangler whoami
#   scripts/cf-env.sh scripts/r2-tests/cf-audit.sh <outdir> <tag>
set -euo pipefail
root=$(cd "$(dirname "$0")/.." && pwd)
env_file=$root/.env.local
[ $# -gt 0 ] || { echo "usage: scripts/cf-env.sh <command> [args...]" >&2; exit 2; }
[ -f "$env_file" ] || { echo "missing $env_file (the FreeWRL account token; see README, \"Credentials\")" >&2; exit 2; }
unset CLOUDFLARE_API_TOKEN CLOUDFLARE_ACCOUNT_ID
set -a; . "$env_file"; set +a
. "$root/scripts/r2-tests/cf-auth.sh"; cf_require_account_token
exec "$@"
