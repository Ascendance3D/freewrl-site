#!/usr/bin/env bash
# Snapshot the Cloudflare state the tests.freewrl.org lane must not disturb.
# Usage: CLOUDFLARE_API_TOKEN=… CLOUDFLARE_ACCOUNT_ID=… cf-audit.sh <outdir> <before|after>
set -euo pipefail
out=$1; tag=$2; mkdir -p "$out"
A=$CLOUDFLARE_ACCOUNT_ID
cf() { curl -sS -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" "https://api.cloudflare.com/client/v4$1"; }
zid() { cf "/zones?name=$1" | jq -r '.result[0].id'; }
ORG=$(zid freewrl.org); COM=$(zid freewrl.com)
cf "/accounts/$A/r2/buckets"                         > "$out/$tag-r2-buckets.json"
cf "/accounts/$A/workers/domains"                    > "$out/$tag-custom-domains.json"
cf "/accounts/$A/workers/scripts/freewrl/deployments" > "$out/$tag-deployments-freewrl.json"
cf "/accounts/$A/workers/scripts/freewrl-www-redirect/deployments" > "$out/$tag-deployments-freewrl-www-redirect.json"
cf "/accounts/$A/rum/site_info/list?per_page=100"               > "$out/$tag-rum-sites.json"
cf "/accounts/$A/rulesets"                           > "$out/$tag-account-rulesets.json"
for z in org:$ORG com:$COM; do n=freewrl.${z%%:*}; id=${z#*:}
  cf "/zones/$id/dns_records?per_page=500"   > "$out/$tag-dns-$n.json"
  cf "/zones/$id/workers/routes"             > "$out/$tag-routes-$n.json"
  cf "/zones/$id/rulesets"                   > "$out/$tag-rulesets-$n.json"
  cf "/zones/$id/settings"                   > "$out/$tag-settings-$n.json"
done
if [ -n "${BUCKET:-}" ]; then
  cf "/accounts/$A/r2/buckets/$BUCKET/domains/custom" > "$out/$tag-r2-custom-domains.json"
  cf "/accounts/$A/r2/buckets/$BUCKET/domains/managed" > "$out/$tag-r2-managed-domain.json"
  cf "/accounts/$A/r2/buckets/$BUCKET/cors"            > "$out/$tag-r2-cors.json"
fi
for f in "$out/$tag"-*.json; do jq -e '.success' "$f" >/dev/null || echo "WARN not success: $f"; done
echo "snapshot $tag -> $out"
