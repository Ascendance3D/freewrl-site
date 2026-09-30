#!/usr/bin/env python3
"""Web derivatives of archival images for freewrl.org.

Reads (never writes) the offline archive copy; writes WebP + JPEG/PNG
fallbacks to public/media/archive/. Originals stay reachable, unchanged,
under /legacy/. Deterministic: same input -> same output.
"""
import json, os
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC = Path(os.environ.get("FREEWRL_ARCHIVE_BROWSE", ROOT.parent / "archive-freewrl-site/browse/freewrl.sourceforge.io"))
OUT = ROOT / "public/media/archive"
OUT.mkdir(parents=True, exist_ok=True)
PICK = [
    "FreeWRL_poster.jpg", "2001.jpg", "OSX-screen.gif", "NCK.jpg", "tictactoe.gif",
    "synth.gif", "aboutPlugins.png", "Test.png", "freewrl_screenshot3.jpg", "welcome.jpg",
    "images/ring_tangle.jpg", "images/PolandPano-Turntablef.jpg", "images/iPhone-running2.png",
    "FreeX3D/images/Toon-Screenshot_2013-08-11-09-39-56.png",
    "FreeX3D/images/Sobel_Screenshot_2013-08-10-09-41-49.png",
    "FreeX3D/images/VertexDeformer-Screenshot_2013-08-10-09-40-43.png",
    "FreeX3D/images/FP_6_2013-04-06-15-46-21.png",
    "images/FragmentVertexSpotLight.png", "images/screenshot_Jan2023_2.jpg", "nav_area.jpg",
]
index = {}
for rel in PICK:
    im = Image.open(SRC / rel)
    im.seek(0)  # first frame of GIFs
    im = im.convert("RGB")
    stem = rel.replace("/", "__").rsplit(".", 1)[0]
    w, h = im.size
    widths = sorted({min(w, 800), min(w, 1600)})
    entry = {"original": rel, "width": w, "height": h, "files": []}
    for tw in widths:
        th = round(h * tw / w)
        r = im.resize((tw, th), Image.LANCZOS) if tw != w else im
        r.save(OUT / f"{stem}-{tw}.webp", quality=82, method=6)
        entry["files"].append({"w": tw, "h": th, "webp": f"/media/archive/{stem}-{tw}.webp"})
    fb = im.resize((widths[0], round(h * widths[0] / w)), Image.LANCZOS) if widths[0] != w else im
    fb.save(OUT / f"{stem}-{widths[0]}.jpg", quality=84, optimize=True, progressive=True)
    entry["fallback"] = f"/media/archive/{stem}-{widths[0]}.jpg"
    index[rel] = entry
(ROOT / "src/data/archive-media.json").write_text(json.dumps(index, indent=1) + "\n")
print(len(index), "images ->", OUT)
