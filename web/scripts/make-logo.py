#!/usr/bin/env python3
"""Build the stacked OPERA logo (O / PE / RA) as an outlined SVG with a
transparent background. Glyphs are converted to paths, so the logo renders
sharp at any size and doesn't need the font installed on the visitor's device.

The letter positions and line spacing are measured from the reference logo
(cap height 22px, baselines 42px apart).

Usage: make-logo.py <font.ttf|otf> <weight> <out.svg> [fill-color]

  weight is only used for variable fonts (e.g. Jost[wght].ttf at 300); pass any
  value for a static font such as Futura Lt BT.

Requires fonttools (python3 -m pip install fonttools).
"""

import sys

from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

CAP_HEIGHT_PX = 22.0
# (baseline y, [(letter, left edge x)]) in reference-image pixels.
LINES = [
    (58, [("O", 39)]),
    (100, [("P", 111), ("E", 135)]),
    (142, [("R", 75), ("A", 98)]),
]


def main() -> None:
    font_path, wght, out = sys.argv[1], float(sys.argv[2]), sys.argv[3]
    color = sys.argv[4] if len(sys.argv) > 4 else "#000"

    font = TTFont(font_path)
    if "fvar" in font:
        font = instantiateVariableFont(font, {"wght": wght})
    glyphs = font.getGlyphSet()
    cmap = font.getBestCmap()
    scale = font["OS/2"].sCapHeight / CAP_HEIGHT_PX

    paths = []
    minx = miny = float("inf")
    maxx = maxy = float("-inf")
    for baseline, letters in LINES:
        for ch, left in letters:
            glyph = glyphs[cmap[ord(ch)]]
            bounds = BoundsPen(glyphs)
            glyph.draw(bounds)
            x0, y0, x1, y1 = bounds.bounds
            dx = left * scale - x0
            by = baseline * scale
            pen = SVGPathPen(glyphs, ntos=lambda v: f"{v:.1f}".rstrip("0").rstrip("."))
            # Font units are y-up; SVG is y-down.
            glyph.draw(TransformPen(pen, (1, 0, 0, -1, dx, by)))
            paths.append(pen.getCommands())
            minx, maxx = min(minx, x0 + dx), max(maxx, x1 + dx)
            miny, maxy = min(miny, by - y1), max(maxy, by - y0)

    w, h = maxx - minx, maxy - miny
    svg = (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{minx:.1f} {miny:.1f} {w:.1f} {h:.1f}" '
        f'width="{w / scale:.2f}" height="{h / scale:.2f}" role="img" aria-label="OPERA">'
        f'<path fill="{color}" d="{" ".join(paths)}"/></svg>\n'
    )
    with open(out, "w") as f:
        f.write(svg)


if __name__ == "__main__":
    main()
