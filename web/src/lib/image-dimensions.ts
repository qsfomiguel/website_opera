import fs from "node:fs/promises";
import path from "node:path";
import { getCloudflareContext } from "@opennextjs/cloudflare";

const SVG_HEAD_BYTES = 1024;

function readPngSize(buffer: Buffer): { width: number; height: number } | null {
  if (buffer.length < 24 || buffer.toString("ascii", 1, 4) !== "PNG") return null;
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

/** Reads the intrinsic size from an SVG's root `width`/`height`, falling back
 * to its `viewBox`. Only the opening tag is needed. */
function readSvgSize(buffer: Buffer): { width: number; height: number } | null {
  const tag = buffer.toString("utf8").match(/<svg\b[^>]*>/)?.[0];
  if (!tag) return null;
  const attr = (name: string) => tag.match(new RegExp(`\\s${name}="([^"]+)"`))?.[1];
  const width = parseFloat(attr("width") ?? "");
  const height = parseFloat(attr("height") ?? "");
  if (width > 0 && height > 0) return { width: Math.round(width), height: Math.round(height) };
  const viewBox = attr("viewBox")?.trim().split(/[\s,]+/).map(Number);
  if (viewBox?.length === 4 && viewBox[2] > 0 && viewBox[3] > 0) {
    return { width: Math.round(viewBox[2]), height: Math.round(viewBox[3]) };
  }
  return null;
}

export function isSvg(imagePath: string): boolean {
  return /\.svg($|\?)/i.test(imagePath);
}

/** Reads a PNG's width/height from its IHDR chunk (bytes 16-23), or an SVG's
 * from its root tag, whether the image lives on local disk (public/...) or a
 * remote URL (Blob storage). */
export async function getImageDimensions(
  imagePath: string,
): Promise<{ width: number; height: number } | null> {
  if (!imagePath) return null;
  const svg = isSvg(imagePath);
  const bytes = svg ? SVG_HEAD_BYTES : 24;
  const read = svg ? readSvgSize : readPngSize;
  try {
    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
      const res = await fetch(imagePath, { headers: { Range: `bytes=0-${bytes - 1}` } });
      if (!res.ok && res.status !== 206) return null;
      return read(Buffer.from(await res.arrayBuffer()));
    }

    return read(await readLocalHead(imagePath, bytes));
  } catch {
    return null;
  }
}

/** public/ is on disk under `next dev`/`next start`, but on Cloudflare Workers
 * it only exists as static assets, served through the ASSETS binding. */
async function readLocalHead(imagePath: string, bytes: number): Promise<Buffer> {
  try {
    const fd = await fs.open(path.join(process.cwd(), "public", imagePath), "r");
    try {
      const buffer = Buffer.alloc(bytes);
      const { bytesRead } = await fd.read(buffer, 0, bytes, 0);
      return buffer.subarray(0, bytesRead);
    } finally {
      await fd.close();
    }
  } catch {
    const { env } = await getCloudflareContext({ async: true });
    const assets = (env as { ASSETS?: { fetch(url: URL): Promise<Response> } }).ASSETS;
    if (!assets) throw new Error("public file not found");
    const res = await assets.fetch(new URL(imagePath, "https://assets.local"));
    if (!res.ok) throw new Error(`asset status ${res.status}`);
    return Buffer.from(await res.arrayBuffer()).subarray(0, bytes);
  }
}
