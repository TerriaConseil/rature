import { ColorSpace, Device, Matrix, type Image, type PDFPage, type Rect } from "mupdf";

import type { DetectedImage } from "@/types/index.ts";

const MIN_IMAGE_DIMENSION = 20; // page points (~7mm)

function rectFromMatrix(ctm: Matrix): Rect {
  const [a, b, c, d, e, f] = ctm;
  const corners = [
    [e, f],
    [e + a, f + b],
    [e + a + c, f + b + d],
    [e + c, f + d],
  ];
  const xs = corners.map(([x]) => x);
  const ys = corners.map(([, y]) => y);
  return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
}

function fnv1aHashByte(hash: number, byte: number): number {
  hash ^= byte;
  hash = Math.imul(hash, 16777619);
  return hash >>> 0;
}

function fnv1aHashInt(hash: number, value: number): number {
  hash = fnv1aHashByte(hash, value & 0xff);
  hash = fnv1aHashByte(hash, (value >> 8) & 0xff);
  hash = fnv1aHashByte(hash, (value >> 16) & 0xff);
  hash = fnv1aHashByte(hash, (value >> 24) & 0xff);
  return hash;
}

function computeImageFingerprint(image: Image): string {
  const w = image.getWidth();
  const h = image.getHeight();

  let hash = 2166136261; // FNV-1a offset basis
  hash = fnv1aHashInt(hash, w);
  hash = fnv1aHashInt(hash, h);

  // Decode the image to a pixmap and sample pixels at regular intervals
  // to create an ~8x8 effective thumbnail hash
  try {
    const pixmap = image.toPixmap();
    const pixels = pixmap.getPixels();
    const pw = pixmap.getWidth();
    const ph = pixmap.getHeight();
    const components = pixels.length / (pw * ph);

    const sampleSize = 8;
    const xStep = Math.max(1, Math.floor(pw / sampleSize));
    const yStep = Math.max(1, Math.floor(ph / sampleSize));

    for (let sy = 0; sy < sampleSize && sy * yStep < ph; sy++) {
      for (let sx = 0; sx < sampleSize && sx * xStep < pw; sx++) {
        const idx = ((sy * yStep) * pw + (sx * xStep)) * components;
        for (let c = 0; c < Math.min(components, 3); c++) {
          hash = fnv1aHashByte(hash, pixels[idx + c]);
        }
      }
    }
  } catch {
    // If pixmap extraction fails, fall back to dimensions-only hash
  }

  return hash.toString(36);
}

export function extractPageImages(page: PDFPage, pageIndex: number): DetectedImage[] {
  const images: DetectedImage[] = [];
  let index = 0;

  const device = new Device({
    fillImage(image: Image, ctm: Matrix) {
      const rect = rectFromMatrix(ctm);
      const rectWidth = rect[2] - rect[0];
      const rectHeight = rect[3] - rect[1];
      if (rectWidth < MIN_IMAGE_DIMENSION || rectHeight < MIN_IMAGE_DIMENSION) return;

      images.push({
        id: `img-${pageIndex}-${index++}`,
        page: pageIndex,
        rect,
        width: image.getWidth(),
        height: image.getHeight(),
        fingerprint: computeImageFingerprint(image),
        included: false,
      });
    },
  });

  page.run(device, Matrix.identity);
  device.close();
  return images;
}

export function extractImageThumbnail(page: PDFPage, rect: Rect, maxSize: number): Uint8Array {
  const [x0, y0, x1, y1] = rect;
  const w = x1 - x0;
  const h = y1 - y0;
  const scale = Math.min(maxSize / w, maxSize / h, 1);
  const matrix: Matrix = [scale, 0, 0, scale, -x0 * scale, -y0 * scale];
  const pixmap = page.toPixmap(matrix, ColorSpace.DeviceRGB, false);
  return pixmap.asPNG();
}
