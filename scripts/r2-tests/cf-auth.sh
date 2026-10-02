# Sourced by the r2-tests shell scripts. Exits, without printing the token, unless
# CLOUDFLARE_API_TOKEN is an active account token for CLOUDFLARE_ACCOUNT_ID.
# Account tokens verify at /accounts/<id>/tokens/verify, not /user/tokens/verify.
cf_auth_help='Run it through scripts/cf-env.sh, which loads .env.local. See README, "Credentials".'
cf_require_account_token() {
  [ -n "${CLOUDFLARE_API_TOKEN:-}" ] && [ -n "${CLOUDFLARE_ACCOUNT_ID:-}" ] || {
    echo "CLOUDFLARE_API_TOKEN or CLOUDFLARE_ACCOUNT_ID is not set. $cf_auth_help" >&2; exit 2; }
  local status
  status=$(curl -sS -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
    "https://api.cloudflare.com/client/v4/accounts/$CLOUDFLARE_ACCOUNT_ID/tokens/verify" |
    jq -r '.result.status // empty')
  [ "$status" = active ] || {
    echo "CLOUDFLARE_API_TOKEN is not an active token for this account (a stale shell export?). $cf_auth_help" >&2
    exit 2; }
}
