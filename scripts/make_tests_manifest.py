#!/usr/bin/env python3
"""Compact manifest of the archived tests/ corpus for the /tests browser.

Reads archive-freewrl-site/URL_MANIFEST.csv (read-only). Writes
public/data/tests-manifest.json: files only (Apache listings dropped),
paths relative to tests/, with size and sha256 so a future R2 upload can
be verified against it.
"""
import csv, json, os
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CSV = Path(os.environ.get("FREEWRL_ARCHIVE_MANIFEST", ROOT.parent / "archive-freewrl-site/URL_MANIFEST.csv"))
PREFIX = "raw/freewrl.sourceforge.io/tests/"
files = []
for row in csv.DictReader(open(CSV, newline="")):
    lp = row["local_path"]
    if lp.startswith(PREFIX) and row["kind"] == "file":
        files.append([lp[len(PREFIX):], int(row["bytes"]), row["sha256"]])
files.sort()
out = {
    "source": "https://freewrl.sourceforge.io/tests/",
    "captured": "2026-09-29/30",
    "missing": ["41_Volume_rendering/supine.nrrd"],
    "fields": ["path", "bytes", "sha256"],
    "files": files,
}
dest = ROOT / "public/data/tests-manifest.json"
dest.write_text(json.dumps(out, separators=(",", ":")) + "\n")
print(len(files), "files,", sum(f[1] for f in files), "bytes ->", dest, dest.stat().st_size, "bytes")
