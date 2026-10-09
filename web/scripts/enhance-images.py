#!/usr/bin/env python3
"""One-off pass: apply modest color/contrast/sharpness enhancement to site images."""

import sys
from pathlib import Path

from PIL import Image, ImageEnhance

ROOT = Path(__file__).resolve().parent.parent
TARGET_DIRS = [ROOT / "public" / "projects" / "genera", ROOT / "public" / "team"]

COLOR = 1.10
CONTRAST = 1.08
BRIGHTNESS = 1.02
SHARPNESS = 1.15


def enhance(path: Path) -> None:
    with Image.open(path) as img:
        img = img.convert("RGB")
        img = ImageEnhance.Color(img).enhance(COLOR)
        img = ImageEnhance.Contrast(img).enhance(CONTRAST)
        img = ImageEnhance.Brightness(img).enhance(BRIGHTNESS)
        img = ImageEnhance.Sharpness(img).enhance(SHARPNESS)
        img.save(path, "JPEG", quality=92, optimize=True)


def main() -> None:
    files = []
    for d in TARGET_DIRS:
        files.extend(sorted(d.glob("*.jpg")))

    total = len(files)
    for i, f in enumerate(files, 1):
        enhance(f)
        if i % 40 == 0 or i == total:
            print(f"{i}/{total}", flush=True)

    print(f"Done. Enhanced {total} images.")


if __name__ == "__main__":
    sys.exit(main())
