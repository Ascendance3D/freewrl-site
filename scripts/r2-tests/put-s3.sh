#!/usr/bin/env bash
# Upload keys that the Cloudflare REST API refuses (its WAF blocks any key containing
# "..", e.g. 11_fogcoord..x3d) through the R2 S3 endpoint instead. Same bytes,
# same Content-Type / Cache-Control rules as upload.py.
#
# S3 credentials are derived from the API token as Cloudflare documents:
# access key = token id, secret = sha256(token value). Nothing is printed or stored.
#
#   CLOUDFLARE_API_TOKEN=… CLOUDFLARE_ACCOUNT_ID=… put-s3.sh <keys.txt> <log.tsv>
set -uo pipefail
here=$(cd "$(dirname "$0")" && pwd)
src=${FREEWRL_TESTS_SRC:-$here/../../../archive-freewrl-site/raw/freewrl.sourceforge.io/tests}
bucket=${FREEWRL_TESTS_BUCKET:-freewrl-tests}
A=$CLOUDFLARE_ACCOUNT_ID
kid=$(curl -sS -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  "https://api.cloudflare.com/client/v4/accounts/$A/tokens/verify" | jq -r .result.id)
secret=$(printf %s "$CLOUDFLARE_API_TOKEN" | sha256sum | cut -d' ' -f1)
fails=0
while IFS= read -r key; do
  [ -n "$key" ] || continue
  read -r ctype cache < <(python3 -c 'import sys; sys.path.insert(0, sys.argv[1]); from upload import *
t = content_type(sys.argv[2]); print(t, cache_control(t).replace(" ", "_"))' "$here" "$key")
  cache=${cache//_/ }
  enc=$(python3 -c 'import sys,urllib.parse; print(urllib.parse.quote(sys.argv[1], safe="/"))' "$key")
  code=$(curl -sS --path-as-is -o /dev/null -w '%{http_code}' -X PUT \
    --aws-sigv4 "aws:amz:auto:s3" --user "$kid:$secret" \
    -H "Content-Type: $ctype" -H "Cache-Control: $cache" \
    -H "x-amz-content-sha256: UNSIGNED-PAYLOAD" \
    --data-binary @"$src/$key" "https://$A.r2.cloudflarestorage.com/$bucket/$enc")
  size=$(stat -c %s "$src/$key")
  if [ "$code" = 200 ]; then st=ok; else st=FAIL; fails=$((fails+1)); fi
  printf '%s\t%s\t%s\t%s\t1\t%s\ts3 PUT http=%s\n' "$key" "$size" "$ctype" "$cache" "$st" "$code" | tee -a "$2"
done < "$1"
exit $((fails > 0))
