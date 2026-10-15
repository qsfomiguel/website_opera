/**
 * Browser port of scripts/process-logo.py: strips a logo's background to
 * transparency and produces two color variants — one for dark backgrounds, one
 * for light — since a single-color logo can't stay visible against both.
 *
 * Runs client-side because Cloudflare Workers can't spawn python3.
 */

const TOLERANCE = 20;
const FEATHER = 60;
const PAD_FRACTION = 0.04;
const TARGET_WIDTH = 1200;

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = sorted.length >> 1;
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function canvas2d(width: number, height: number) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas 2d context unavailable");
  return { canvas, ctx };
}

function toPng(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("PNG encode failed"))), "image/png"),
  );
}

export async function processLogo(file: File): Promise<{ dark: Blob; light: Blob }> {
  const bitmap = await createImageBitmap(file);
  const { width: w, height: h } = bitmap;
  const src = canvas2d(w, h);
  src.ctx.drawImage(bitmap, 0, 0);
  bitmap.close();
  const image = src.ctx.getImageData(0, 0, w, h);
  const px = image.data;

  // Median color of a 3px border strip is the background reference — more
  // robust than single corner pixels against noise/anti-aliasing.
  const border: [number[], number[], number[]] = [[], [], []];
  const strip = Math.min(3, w, h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (y >= strip && y < h - strip && x >= strip && x < w - strip) continue;
      const i = (y * w + x) * 4;
      border[0].push(px[i]);
      border[1].push(px[i + 1]);
      border[2].push(px[i + 2]);
    }
  }
  const bg = border.map(median);

  // Alpha from distance to the background color; also average the solid,
  // unsaturated foreground pixels to find the logo's single ink color.
  const alpha = new Float32Array(w * h);
  let fgSum = [0, 0, 0];
  let fgCount = 0;
  for (let p = 0, i = 0; p < w * h; p++, i += 4) {
    const r = px[i], g = px[i + 1], b = px[i + 2];
    const dist = Math.hypot(r - bg[0], g - bg[1], b - bg[2]);
    const norm = Math.min(1, Math.max(0, (dist - TOLERANCE) / FEATHER));
    alpha[p] = Math.min(px[i + 3], norm * 255);
    if (norm > 0.95 && Math.max(r, g, b) - Math.min(r, g, b) < 25) {
      fgSum = [fgSum[0] + r, fgSum[1] + g, fgSum[2] + b];
      fgCount++;
    }
  }
  const fg = fgCount ? fgSum.map((v) => v / fgCount) : [255, 255, 255];

  // Every non-background pixel gets the one solid foreground color and the
  // alpha channel alone carries the anti-aliasing, so edges don't keep a halo
  // of the source photo's background when composited over another color.
  let minX = w, minY = h, maxX = -1, maxY = -1;
  for (let p = 0, i = 0; p < w * h; p++, i += 4) {
    px[i] = fg[0];
    px[i + 1] = fg[1];
    px[i + 2] = fg[2];
    px[i + 3] = alpha[p];
    if (px[i + 3] > 0) {
      const x = p % w, y = (p / w) | 0;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
  src.ctx.putImageData(image, 0, 0);

  // Trim transparent padding so the logo fills its display box.
  let cropX = 0, cropY = 0, cropW = w, cropH = h;
  if (maxX >= 0) {
    const padX = Math.round((maxX + 1 - minX) * PAD_FRACTION);
    const padY = Math.round((maxY + 1 - minY) * PAD_FRACTION);
    cropX = Math.max(0, minX - padX);
    cropY = Math.max(0, minY - padY);
    cropW = Math.min(w, maxX + 1 + padX) - cropX;
    cropH = Math.min(h, maxY + 1 + padY) - cropY;
  }

  // Upscale small logos for HQ display. The Python version also applied
  // contrast/sharpness, but those are no-ops on a single flat color.
  const scale = cropW < TARGET_WIDTH ? TARGET_WIDTH / cropW : 1;
  const outW = Math.round(cropW * scale);
  const outH = Math.round(cropH * scale);
  const out = canvas2d(outW, outH);
  out.ctx.imageSmoothingQuality = "high";
  out.ctx.drawImage(src.canvas, cropX, cropY, cropW, cropH, 0, 0, outW, outH);

  const inverted = canvas2d(outW, outH);
  const invData = out.ctx.getImageData(0, 0, outW, outH);
  for (let i = 0; i < invData.data.length; i += 4) {
    invData.data[i] = 255 - invData.data[i];
    invData.data[i + 1] = 255 - invData.data[i + 1];
    invData.data[i + 2] = 255 - invData.data[i + 2];
  }
  inverted.ctx.putImageData(invData, 0, 0);

  const luminance = 0.299 * fg[0] + 0.587 * fg[1] + 0.114 * fg[2];
  // A light-colored upload is already right for a dark background.
  const [forDark, forLight] = luminance > 128 ? [out.canvas, inverted.canvas] : [inverted.canvas, out.canvas];
  const [dark, light] = await Promise.all([toPng(forDark), toPng(forLight)]);
  return { dark, light };
}
