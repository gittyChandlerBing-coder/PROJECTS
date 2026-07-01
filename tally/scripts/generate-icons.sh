#!/usr/bin/env bash
# Regenerates every raster icon in public/icons and public/favicon.ico from
# the two hand-authored SVG sources (public/icons/icon.svg and
# maskable-icon.svg). Re-run this after editing either SVG.
#
# Requires rsvg-convert and ImageMagick's `convert`:
#   Debian/Ubuntu: apt-get install librsvg2-bin imagemagick
#   macOS:         brew install librsvg imagemagick

set -euo pipefail
cd "$(dirname "$0")/../public/icons"

rsvg-convert -w 192 -h 192 icon.svg -o icon-192.png
rsvg-convert -w 512 -h 512 icon.svg -o icon-512.png
rsvg-convert -w 180 -h 180 icon.svg -o apple-touch-icon.png
rsvg-convert -w 32 -h 32 icon.svg -o favicon-32.png
rsvg-convert -w 512 -h 512 maskable-icon.svg -o maskable-icon-512.png

rsvg-convert -w 16 -h 16 icon.svg -o /tmp/tally-favicon-16.png
rsvg-convert -w 48 -h 48 icon.svg -o /tmp/tally-favicon-48.png
convert /tmp/tally-favicon-16.png favicon-32.png /tmp/tally-favicon-48.png \
  -colors 256 ../favicon.ico

echo "Icons regenerated in public/icons and public/favicon.ico"
