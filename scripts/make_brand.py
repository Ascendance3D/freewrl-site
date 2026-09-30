#!/usr/bin/env python3
"""Deterministic brand-asset build from logo-work/1.png and logo-work/2.png.

Sources are never modified. Output goes to public/brand/ and public/.
  1.png: hand + eye + white/orange "FreeWRL" lettering (for dark grounds)
  2.png: same mark with dark lettering (for light grounds)
Clean-up: the source alpha has ~1,200 loose, nearly invisible blue specks
(alpha <= 10) around the fingers. We keep faint pixels only when they sit
within a few pixels of a real shape, so the soft glow survives and the
specks go.
Run: python3 scripts/make_brand.py   (needs Pillow, numpy, scipy)
"""
from pathlib import Path
import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "logo-work"
OUT = ROOT / "public" / "brand"
OUT.mkdir(parents=True, exist_ok=True)


def clean(rgba: np.ndarray, solid=26, min_area=1000, halo=6) -> np.ndarray:
    a = rgba[..., 3]
    lab, n = ndimage.label(a > solid)
    sizes = ndimage.sum(np.ones_like(a), lab, range(1, n + 1))
    keep = np.isin(lab, [i + 1 for i, s in enumerate(sizes) if s >= min_area])
    near = ndimage.binary_dilation(keep, iterations=halo)
    out = rgba.copy()
    out[..., 3] = np.where(near, a, 0)
    out[out[..., 3] == 0, :3] = 0
    return out


def mark_only(rgba: np.ndarray) -> np.ndarray:
    """Hand + eye without lettering: drop everything outside the eye circle
    that is not part of a finger (fingers are the blue components that do
    not touch the eye/lettering component)."""
    a = rgba[..., 3]
    lab, n = ndimage.label(a > 26)
    sizes = ndimage.sum(np.ones_like(a), lab, range(1, n + 1))
    big = int(np.argmax(sizes)) + 1  # eye (+ lettering touching it)
    r, g, b = (rgba[..., i].astype(int) for i in range(3))
    blue = (lab == big) & (b > r + 40) & (b > 120)
    ys, xs = np.nonzero(blue)
    cy, cx = ys.mean(), xs.mean()
    rad = np.percentile(np.hypot(ys - cy, xs - cx), 99.5) * 1.08
    yy, xx = np.mgrid[: a.shape[0], : a.shape[1]]
    in_eye = np.hypot(yy - cy, xx - cx) <= rad
    fingers = np.zeros_like(a, bool)
    for i, s in enumerate(sizes):
        comp = lab == i + 1
        # fingers are blue; the lettering component is white/orange
        if i + 1 != big and s >= 1000 and (blue_px := ((b > r + 40) & comp).sum()) > 0.5 * s:
            fingers |= comp
    keep = ndimage.binary_dilation(fingers | ((lab == big) & in_eye), iterations=6) & (in_eye | ~(lab == big))
    out = rgba.copy()
    out[..., 3] = np.where(keep, a, 0)
    return out


def crop_square(im: Image.Image, pad=0.04) -> Image.Image:
    x0, y0, x1, y1 = im.getbbox()
    side = int(max(x1 - x0, y1 - y0) * (1 + pad * 2))
    cx, cy = (x0 + x1) // 2, (y0 + y1) // 2
    canvas = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    canvas.paste(im.crop((cx - side // 2, cy - side // 2, cx + side // 2, cy + side // 2)), (0, 0))
    return canvas


def save(im: Image.Image, name: str, size=None):
    if size:
        im = im.resize((size, size), Image.LANCZOS)
    im.save(OUT / f"{name}.png", optimize=True)
    im.save(OUT / f"{name}.webp", quality=90, method=6)


src1 = np.array(Image.open(SRC / "1.png").convert("RGBA"))
src2 = np.array(Image.open(SRC / "2.png").convert("RGBA"))
on_dark = crop_square(Image.fromarray(clean(src1)))
on_light = crop_square(Image.fromarray(clean(src2)))
mark = crop_square(Image.fromarray(mark_only(clean(src1))), pad=0.02)

for size in (640, 320):
    save(on_dark, f"freewrl-logo-on-dark-{size}", size)
    save(on_light, f"freewrl-logo-on-light-{size}", size)
save(mark, "freewrl-mark-512", 512)

pub = ROOT / "public"
mark.resize((32, 32), Image.LANCZOS).save(pub / "favicon-32.png", optimize=True)
mark.resize((16, 16), Image.LANCZOS).save(pub / "favicon-16.png", optimize=True)
mark.resize((192, 192), Image.LANCZOS).save(pub / "icon-192.png", optimize=True)
mark.save(pub / "favicon.ico", sizes=[(16, 16), (32, 32), (48, 48)])
touch = Image.new("RGBA", (180, 180), (14, 17, 38, 255))
touch.alpha_composite(mark.resize((156, 156), Image.LANCZOS), (12, 12))
touch.convert("RGB").save(pub / "apple-touch-icon.png", optimize=True)
print("brand assets written to", OUT)
