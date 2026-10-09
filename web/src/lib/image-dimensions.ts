import fs from "node:fs/promises";
import path from "node:path";

function readWidthHeight(buffer: Buffer): { width: number; height: number } | null {
  if (buffer.length < 24 || buffer.toString("ascii", 1, 4) !== "PNG") return null;
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

/** Reads width/height straight from a PNG's IHDR chunk (bytes 16-23), whether
 * the image lives on local disk (public/...) or a remote URL (Blob storage). */
export async function getPngDimensions(
  imagePath: string,
): Promise<{ width: number; height: number } | null> {
  if (!imagePath) return null;
  try {
    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
      const res = await fetch(imagePath, { headers: { Range: "bytes=0-23" } });
      if (!res.ok && res.status !== 206) return null;
      const buffer = Buffer.from(await res.arrayBuffer());
      return readWidthHeight(buffer);
    }

    const filePath = path.join(process.cwd(), "public", imagePath);
    const fd = await fs.open(filePath, "r");
    try {
      const buffer = Buffer.alloc(24);
      await fd.read(buffer, 0, 24, 0);
      return readWidthHeight(buffer);
    } finally {
      await fd.close();
    }
  } catch {
    return null;
  }
}
