#!/usr/bin/env python3
"""Web copies of real FreeWRL captures for freewrl.org.

Reads media-src/captures/captures.json and the PNGs beside it (never writes
them). An optional "crop" [left, top, right, bottom] trims a capture for
presentation only (e.g. a window's drop shadow, or empty space around an item);
transparent pixels are laid on black, the capture frame colour. Writes WebP at two widths plus a JPEG fallback to
public/media/captures/, and the index src/data/captures.json.
Deterministic: same input -> same output. Run: npm run assets:captures
"""
import json
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "media-src/captures"
OUT = ROOT / "public/media/captures"
OUT.mkdir(parents=True, exist_ok=True)
meta = json.loads((SRC / "captures.json").read_text())

index = {}
for c in meta["captures"]:
    src = Image.open(SRC / f"{c['id']}.png")
    if "crop" in c:
        src = src.crop(tuple(c["crop"]))
    if src.mode in ("RGBA", "LA", "P"):
        src = src.convert("RGBA")
        im = Image.new("RGB", src.size, (0, 0, 0))
        im.paste(src, mask=src.getchannel("A"))
    else:
        im = src.convert("RGB")
    w, h = im.size
    files = []
    for tw in sorted({min(w, 640), min(w, 1280)}):
        th = round(h * tw / w)
        r = im.resize((tw, th), Image.LANCZOS) if tw != w else im
        r.save(OUT / f"{c['id']}-{tw}.webp", quality=84, method=6)
        files.append({"w": tw, "h": th, "webp": f"/media/captures/{c['id']}-{tw}.webp"})
    fw = min(w, 960)
    fb = im.resize((fw, round(h * fw / w)), Image.LANCZOS) if fw != w else im
    fb.save(OUT / f"{c['id']}-{fw}.jpg", quality=82, optimize=True, progressive=True)
    index[c["id"]] = {
        **{k: c[k] for k in ("world", "viewpoint", "alt", "title")},
        **{k: meta["_platforms"][c["platform"]][k] for k in ("label", "date", "detail")},
        "width": w, "height": h, "files": files,
        "fallback": f"/media/captures/{c['id']}-{fw}.jpg",
    }
(ROOT / "src/data/captures.json").write_text(json.dumps(index, indent=1) + "\n")
print(len(index), "captures ->", OUT)
