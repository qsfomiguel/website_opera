#!/usr/bin/env python3
"""Strip a logo's background to transparency, sharpen it for HQ display, and
produce two color variants — one for dark backgrounds, one for light — since a
single-color logo can't stay visible against both.

Usage: process-logo.py <input> <out_for_dark_bg.png> <out_for_light_bg.png>
"""

import sys

import numpy as np
from PIL import Image, ImageEnhance


def remove_background(
    img: Image.Image, tolerance: float = 20.0, feather: float = 60.0
) -> tuple[Image.Image, np.ndarray]:
    img = img.convert("RGBA")
    arr = np.asarray(img).astype(np.float32)
    rgb = arr[:, :, :3]
    orig_alpha = arr[:, :, 3]

    # Sample a thin border strip on each edge and use the median color as the
    # background reference — more robust than single corner pixels against
    # noise/anti-aliasing in the source image.
    border = np.concatenate(
        [
            rgb[0:3, :, :].reshape(-1, 3),
            rgb[-3:, :, :].reshape(-1, 3),
            rgb[:, 0:3, :].reshape(-1, 3),
            rgb[:, -3:, :].reshape(-1, 3),
        ]
    )
    bg = np.median(border, axis=0)

    dist = np.sqrt(np.sum((rgb - bg) ** 2, axis=2))
    alpha_norm = np.clip((dist - tolerance) / feather, 0.0, 1.0)
    new_alpha = np.minimum(orig_alpha, alpha_norm * 255.0)

    maxc, minc = rgb.max(axis=2), rgb.min(axis=2)
    saturation = maxc - minc
    solid_fg = (alpha_norm > 0.95) & (saturation < 25)
    fg_color = (
        rgb[solid_fg].reshape(-1, 3).mean(axis=0) if solid_fg.any() else np.array([255.0, 255.0, 255.0])
    )

    # A naive cutout keeps each edge/anti-aliased pixel's original color, which
    # is really the foreground blended toward whatever background the source
    # photo happened to have (usually white). That blend is only invisible
    # once composited back over a white page — over any other color (a beige
    # section background, a photo) the leftover white bias shows up as a
    # pale halo/border traced around every letter. A logo is flat lettering,
    # so there's no real color information to preserve at the edge anyway:
    # force every non-background pixel to the single solid foreground color
    # and let the alpha channel alone carry the antialiasing fade. Composited
    # over any background color, that fade now blends correctly with no
    # fringe.
    arr[:, :, :3] = fg_color[None, None, :]
    arr[:, :, 3] = new_alpha
    return Image.fromarray(arr.astype(np.uint8), "RGBA"), fg_color


def autocrop(img: Image.Image, pad_fraction: float = 0.04) -> Image.Image:
    """Trim transparent padding around the cutout so the logo fills its
    display box instead of floating tiny inside a mostly-empty canvas."""
    bbox = img.getbbox()
    if bbox is None:
        return img
    left, top, right, bottom = bbox
    pad_x = round((right - left) * pad_fraction)
    pad_y = round((bottom - top) * pad_fraction)
    w, h = img.size
    return img.crop(
        (
            max(0, left - pad_x),
            max(0, top - pad_y),
            min(w, right + pad_x),
            min(h, bottom + pad_y),
        )
    )


def enhance(img: Image.Image, target_w: int = 1200) -> Image.Image:
    w, h = img.size
    if w < target_w:
        scale = target_w / w
        img = img.resize((round(w * scale), round(h * scale)), Image.LANCZOS)

    rgb = Image.merge("RGB", img.split()[:3])
    rgb = ImageEnhance.Contrast(rgb).enhance(1.12)
    rgb = ImageEnhance.Sharpness(rgb).enhance(1.4)
    r, g, b = rgb.split()
    return Image.merge("RGBA", (r, g, b, img.split()[3]))


def invert_rgb(img: Image.Image) -> Image.Image:
    r, g, b, a = img.split()
    invert = lambda band: band.point(lambda v: 255 - v)
    return Image.merge("RGBA", (invert(r), invert(g), invert(b), a))


def main() -> None:
    src, out_dark_bg, out_light_bg = sys.argv[1], sys.argv[2], sys.argv[3]

    img = Image.open(src)
    img, fg_color = remove_background(img)
    img = autocrop(img)
    img = enhance(img)

    luminance = 0.299 * fg_color[0] + 0.587 * fg_color[1] + 0.114 * fg_color[2]
    if luminance > 128:
        # Uploaded logo is light-colored: already right for a dark background.
        for_dark_bg, for_light_bg = img, invert_rgb(img)
    else:
        for_dark_bg, for_light_bg = invert_rgb(img), img

    for_dark_bg.save(out_dark_bg, "PNG", optimize=True)
    for_light_bg.save(out_light_bg, "PNG", optimize=True)


if __name__ == "__main__":
    main()
