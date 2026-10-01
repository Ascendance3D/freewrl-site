#!/usr/bin/env python3
"""Verify the R2 test corpus against tests-corpus.sha256.

1. Lists every object in the bucket (Cloudflare REST API) and checks key set,
   size, Content-Type and Cache-Control against the manifest and upload.py rules.
2. Downloads every object from the public host and checks its SHA-256 and
   Content-Length against the manifest (--sample N limits this to N objects plus
   every file over 25 MiB).

Needs CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID for step 1.

  verify.py <outdir> [--base https://tests.freewrl.org/] [--sample N] [--skip-list]
"""
import argparse, hashlib, json, os, random, sys, urllib.parse, urllib.request
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from upload import MANIFEST, BUCKET, SRC, content_type, cache_control  # noqa: E402

BIG = 25 * 1024 * 1024
UA = "freewrl-tests-verify/1"


def api(path):
    req = urllib.request.Request("https://api.cloudflare.com/client/v4" + path, headers={
        "Authorization": "Bearer " + os.environ["CLOUDFLARE_API_TOKEN"], "User-Agent": UA})
    return json.load(urllib.request.urlopen(req, timeout=60))


def list_objects():
    acc, out, cursor = os.environ["CLOUDFLARE_ACCOUNT_ID"], {}, ""
    while True:
        q = "?per_page=1000" + (f"&cursor={urllib.parse.quote(cursor)}" if cursor else "")
        r = api(f"/accounts/{acc}/r2/buckets/{BUCKET}/objects{q}")
        for o in r["result"]:
            out[o["key"]] = o
        cursor = (r.get("result_info") or {}).get("cursor")
        if not (r.get("result_info") or {}).get("is_truncated"):
            return out


def fetch(base, key):
    url = base + urllib.parse.quote(key, safe="/")
    h = hashlib.sha256()
    try:
        with urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": UA}), timeout=300) as r:
            n = 0
            for chunk in iter(lambda: r.read(1 << 20), b""):
                h.update(chunk); n += len(chunk)
            return key, r.status, r.headers.get("Content-Length"), n, h.hexdigest(), r.headers.get("Content-Type")
    except Exception as e:  # recorded as a failure row
        return key, getattr(e, "code", "ERR"), None, 0, str(e)[:120], None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("outdir")
    ap.add_argument("--base", default="https://tests.freewrl.org/")
    ap.add_argument("--sample", type=int)
    ap.add_argument("--skip-list", action="store_true")
    a = ap.parse_args()
    out = Path(a.outdir); out.mkdir(parents=True, exist_ok=True)
    want = {}
    for l in open(MANIFEST):
        h, k = l.rstrip("\n").split("  ", 1)
        want[k] = (h, (SRC / k).stat().st_size)
    bad = 0

    if not a.skip_list:
        objs = list_objects()
        with open(out / "object-inventory.tsv", "w") as f:
            for k, o in sorted(objs.items()):
                m = o.get("http_metadata", {})
                f.write(f"{k}\t{o['size']}\t{o['etag']}\t{m.get('contentType')}\t{m.get('cacheControl')}\n")
        missing, extra = sorted(set(want) - set(objs)), sorted(set(objs) - set(want))
        meta = [k for k in want if k in objs and (
            int(objs[k]["size"]) != want[k][1]
            or objs[k].get("http_metadata", {}).get("contentType") != content_type(k)
            or objs[k].get("http_metadata", {}).get("cacheControl") != cache_control(content_type(k)))]
        print(f"listing: objects={len(objs)} bytes={sum(int(o['size']) for o in objs.values())} "
              f"missing={len(missing)} extra={len(extra)} size/meta mismatches={len(meta)}")
        for k in missing[:20] + extra[:20] + meta[:20]:
            print("  ", k)
        bad += len(missing) + len(extra) + len(meta)

    keys = sorted(want)
    if a.sample:
        big = [k for k in keys if want[k][1] > BIG]
        keys = sorted(set(big) | set(random.Random(20261001).sample(keys, a.sample)))
    with open(out / "download-sha256.tsv", "w") as f, ThreadPoolExecutor(8) as ex:
        ok = 0
        for key, status, clen, n, digest, ctype in ex.map(lambda k: fetch(a.base, k), keys):
            good = status == 200 and digest == want[key][0] and n == want[key][1] and str(n) == clen
            ok += good
            f.write(f"{key}\t{status}\t{clen}\t{n}\t{digest}\t{ctype}\t{'ok' if good else 'BAD'}\n")
            if not good:
                print("BAD", key, status, clen, n, digest[:16])
    print(f"download: checked={len(keys)} sha256-ok={ok} bad={len(keys) - ok}")
    bad += len(keys) - ok
    sys.exit(1 if bad else 0)


if __name__ == "__main__":
    main()
