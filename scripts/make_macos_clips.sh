#!/usr/bin/env bash
# Web copies of the macOS FreeWRL screen recordings (freewrl-macos-media-2026-10-02 package).
# Reads the source .mov files (never writes them). Writes silent H.264 MP4s with faststart to
# public/media/captures/ and a first-frame poster PNG per clip to media-src/captures/
# (then run: npm run assets:captures). The .mov sources stay in the package; their SHA-256
# are recorded in media-src/captures/captures.json.
# Usage: scripts/make_macos_clips.sh <path-to>/freewrl-macos-media-2026-10-02
set -euo pipefail
PKG=${1:?usage: make_macos_clips.sh <media package dir>}
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/public/media/captures"
SRC="$ROOT/media-src/captures"

clip() { # name WxH
  local in="$PKG/videos/$1.mov" w=${2%x*} h=${2#*x}
  ffmpeg -v error -y -i "$in" -an \
    -vf "fps=30,scale=$w:$h:flags=lanczos,format=yuv420p" \
    -c:v libx264 -preset veryslow -crf 25 -profile:v high -pix_fmt yuv420p \
    -color_primaries bt709 -color_trc bt709 -colorspace bt709 \
    -movflags +faststart -map_metadata -1 -fflags +bitexact -flags:v +bitexact \
    "$OUT/$1-$w.mp4"
  ffmpeg -v error -y -i "$in" -frames:v 1 -vf "scale=$w:$h:flags=lanczos" "$SRC/$1-poster.png"
  echo "$1-$w.mp4 $(stat -c%s "$OUT/$1-$w.mp4") bytes"
}

clip macos-finder-open-wrl 1200x912   # 1400x1064 source, exact 6/7
clip macos-navigation 1200x800        # 2400x1600 source, exact 1/2
clip macos-controls 1200x800
