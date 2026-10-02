#!/usr/bin/env python3
"""Upload the archived tests/ corpus to the R2 bucket behind tests.freewrl.org.

Reads the archive read-only. Object key = path relative to tests/ (no prefix).
Every file listed in tests-corpus.sha256 is uploaded with `wrangler r2 object put
--remote`, bytes unchanged, with a Content-Type from TYPES and a Cache-Control
from cache_control(). Results go to a TSV log; a non-zero exit means at least
one object failed after retries.

Needs CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID (the account token in .env.local).

  upload.py <log.tsv> [--only paths.txt] [--jobs 8]
"""
import argparse, json, os, subprocess, sys, time, urllib.error, urllib.request
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent
SRC = Path(os.environ.get("FREEWRL_TESTS_SRC",
          ROOT.parent / "archive-freewrl-site/raw/freewrl.sourceforge.io/tests"))
MANIFEST = HERE / "tests-corpus.sha256"
BUCKET = os.environ.get("FREEWRL_TESTS_BUCKET", "freewrl-tests")
OCTET = "application/octet-stream"

# Only types we are sure of. Anything else (nrrd, bvh, web3dit, dds, blend, class,
# exe, dll, x3dz, ...) is served as application/octet-stream.
TYPES = {
    "wrl": "model/vrml", "vrml": "model/vrml",
    "x3d": "model/x3d+xml", "x3dv": "model/x3d-vrml", "x3db": "model/x3d+binary",
    "html": "text/html", "htm": "text/html", "xhtml": "application/xhtml+xml",
    "js": "text/javascript", "css": "text/css",
    "png": "image/png", "jpg": "image/jpeg", "jpeg": "image/jpeg", "gif": "image/gif",
    "svg": "image/svg+xml", "bmp": "image/bmp",
    "txt": "text/plain", "log": "text/plain", "c": "text/plain", "h": "text/plain",
    "py": "text/plain", "java": "text/plain", "pl": "text/plain", "bat": "text/plain",
    "vb": "text/plain", "fs": "text/plain", "vs": "text/plain",
    "xml": "application/xml", "wsdl": "application/wsdl+xml", "rtf": "application/rtf",
    "pdf": "application/pdf", "ps": "application/postscript",
    "doc": "application/msword",
    "pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "zip": "application/zip", "gz": "application/gzip", "gzip": "application/gzip",
    "tar": "application/x-tar", "jar": "application/java-archive",
    "kmz": "application/vnd.google-earth.kmz",
    "mp4": "video/mp4", "mpeg": "video/mpeg", "mpg": "video/mpeg", "avi": "video/x-msvideo",
    "mp3": "audio/mpeg", "mp2": "audio/mpeg", "wav": "audio/wav", "ogg": "audio/ogg",
    "au": "audio/basic", "mid": "audio/midi",
}
# no-transform: the freewrl.org zone has Automatic HTTPS Rewrites and Email Obfuscation on,
# which otherwise rewrite archived HTML at the edge. no-transform keeps served bytes exact.
HTML_CACHE = "public, max-age=3600, no-transform"
ASSET_CACHE = "public, max-age=604800"


def content_type(key):
    name = key.rsplit("/", 1)[-1]
    ext = name.rsplit(".", 1)[1].lower() if "." in name[1:] else ""
    return TYPES.get(ext, OCTET)


def cache_control(ctype):
    return HTML_CACHE if ctype in ("text/html", "application/xhtml+xml") else ASSET_CACHE


def put(key, retries=3):
    ctype = content_type(key)
    cache = cache_control(ctype)
    f = SRC / key
    cmd = ["npx", "--no-install", "wrangler", "r2", "object", "put", f"{BUCKET}/{key}",
           "--remote", "--file", str(f), "--content-type", ctype, "--cache-control", cache]
    for attempt in range(1, retries + 1):
        r = subprocess.run(cmd, cwd=ROOT, capture_output=True, text=True)
        if r.returncode == 0 and "Upload complete" in r.stdout + r.stderr:
            return key, f.stat().st_size, ctype, cache, attempt, "ok", ""
        err = (r.stderr or r.stdout).strip().replace("\n", " ")[-300:]
        time.sleep(5 * attempt)
    return key, f.stat().st_size, ctype, cache, attempt, "FAIL", err


def require_account_token():
    """Exit, without printing the token, unless CLOUDFLARE_API_TOKEN is an active
    account token for CLOUDFLARE_ACCOUNT_ID. Account tokens verify at
    /accounts/<id>/tokens/verify, not /user/tokens/verify."""
    tok, acc = os.environ.get("CLOUDFLARE_API_TOKEN"), os.environ.get("CLOUDFLARE_ACCOUNT_ID")
    status = None
    if tok and acc:
        req = urllib.request.Request(
            f"https://api.cloudflare.com/client/v4/accounts/{acc}/tokens/verify",
            headers={"Authorization": "Bearer " + tok, "User-Agent": "freewrl-tests-auth/1"})
        try:
            status = json.load(urllib.request.urlopen(req, timeout=30))["result"]["status"]
        except (urllib.error.HTTPError, KeyError, TypeError):
            pass
    if status != "active":
        sys.exit("CLOUDFLARE_API_TOKEN / CLOUDFLARE_ACCOUNT_ID missing, or not an active token "
                 "for this account (a stale shell export?). Run it through scripts/cf-env.sh, "
                 "which loads .env.local. See README, \"Credentials\".")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("log")
    ap.add_argument("--only")
    ap.add_argument("--jobs", type=int, default=8)
    a = ap.parse_args()
    require_account_token()
    keys = [l.rstrip("\n").split("  ", 1)[1] for l in open(MANIFEST)]
    if a.only:
        want = {l.rstrip("\n") for l in open(a.only) if l.strip()}
        keys = [k for k in keys if k in want]
    fails = 0
    with open(a.log, "a") as log, ThreadPoolExecutor(a.jobs) as ex:
        for i, row in enumerate(ex.map(put, keys), 1):
            log.write("\t".join(map(str, row)) + "\n"); log.flush()
            if row[5] != "ok":
                fails += 1
                print("FAIL", row[0], row[6], file=sys.stderr)
            if i % 100 == 0:
                print(f"{i}/{len(keys)} fails={fails}", flush=True)
    print(f"done {len(keys)} fails={fails}")
    sys.exit(1 if fails else 0)


if __name__ == "__main__":
    main()
