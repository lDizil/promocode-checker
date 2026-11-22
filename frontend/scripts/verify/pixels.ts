import pixelmatch from 'pixelmatch'
import { PNG } from 'pngjs'

import { unionRect, type Rect } from './diff.ts'

const CELL = 16

/** Pixel diff of two full-page screenshots; differing areas come back as rectangles in page coordinates. */
export function diffPixels(basePng: Buffer, headPng: Buffer): { diff: PNG; regions: Rect[]; changed: number } {
  const base = PNG.sync.read(basePng)
  const head = PNG.sync.read(headPng)
  const width = Math.max(base.width, head.width)
  const height = Math.max(base.height, head.height)
  const a = pad(base, width, height)
  const b = pad(head, width, height)
  const diff = new PNG({ width, height })
  const changed = pixelmatch(a.data, b.data, diff.data, width, height, { threshold: 0.1, diffColorAlt: [0, 160, 255] })

  // Cluster differing pixels into cells, then cells into connected regions.
  const cols = Math.ceil(width / CELL)
  const rows = Math.ceil(height / CELL)
  const cells = new Uint8Array(cols * rows)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4
      // pixelmatch paints differences red (base darker) or blue (head darker) at full opacity.
      const red = diff.data[i] === 255 && diff.data[i + 1] === 0 && diff.data[i + 2] === 0
      const blue = diff.data[i] === 0 && diff.data[i + 1] === 160 && diff.data[i + 2] === 255
      if (red || blue) cells[Math.floor(y / CELL) * cols + Math.floor(x / CELL)] = 1
    }
  }
  const regions: Rect[] = []
  const stack: number[] = []
  for (let start = 0; start < cells.length; start++) {
    if (cells[start] !== 1) continue
    let minX = cols
    let minY = rows
    let maxX = 0
    let maxY = 0
    stack.push(start)
    cells[start] = 2
    while (stack.length > 0) {
      const cell = stack.pop()!
      const cx = cell % cols
      const cy = Math.floor(cell / cols)
      minX = Math.min(minX, cx)
      minY = Math.min(minY, cy)
      maxX = Math.max(maxX, cx)
      maxY = Math.max(maxY, cy)
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const nx = cx + dx
          const ny = cy + dy
          if (nx < 0 || ny < 0 || nx >= cols || ny >= rows) continue
          const next = ny * cols + nx
          if (cells[next] === 1) {
            cells[next] = 2
            stack.push(next)
          }
        }
      }
    }
    regions.push({
      x: minX * CELL,
      y: minY * CELL,
      w: Math.min(width, (maxX + 1) * CELL) - minX * CELL,
      h: Math.min(height, (maxY + 1) * CELL) - minY * CELL,
    })
  }
  return { diff, regions, changed }
}

function pad(png: PNG, width: number, height: number): PNG {
  if (png.width === width && png.height === height) return png
  const out = new PNG({ width, height, fill: true })
  PNG.bitblt(png, out, 0, 0, png.width, png.height, 0, 0)
  return out
}

/** Side-by-side «было | стало» crop around a change, enlarged when small so a model can read it. */
export function beforeAfter(basePng: Buffer, headPng: Buffer, base: Rect | undefined, head: Rect | undefined): Buffer {
  const left = PNG.sync.read(basePng)
  const right = PNG.sync.read(headPng)
  const combined = unionRect([base, head].filter((rect): rect is Rect => rect !== undefined))
  if (!combined) throw new Error('beforeAfter требует хотя бы один прямоугольник')
  const box = expand(combined, 24)
  const a = crop(left, box)
  const b = crop(right, box)
  const scale = box.w < 240 && box.h < 240 ? 3 : box.w < 480 ? 2 : 1
  const gap = 12
  const out = new PNG({ width: (box.w * 2 + gap) * scale, height: box.h * scale, fill: true })
  out.data.fill(255)
  blitScaled(a, out, 0, scale)
  blitScaled(b, out, (box.w + gap) * scale, scale)
  return PNG.sync.write(out)
}

function expand(rect: Rect, by: number): Rect {
  const x = Math.max(0, rect.x - by)
  const y = Math.max(0, rect.y - by)
  return { x, y, w: Math.min(rect.w + by * 2, 1200), h: Math.min(rect.h + by * 2, 900) }
}

function crop(png: PNG, rect: Rect): PNG {
  const out = new PNG({ width: rect.w, height: rect.h, fill: true })
  out.data.fill(255)
  const w = Math.max(0, Math.min(rect.w, png.width - rect.x))
  const h = Math.max(0, Math.min(rect.h, png.height - rect.y))
  if (w > 0 && h > 0) PNG.bitblt(png, out, rect.x, rect.y, w, h, 0, 0)
  return out
}

function blitScaled(src: PNG, dst: PNG, offsetX: number, scale: number) {
  for (let y = 0; y < src.height * scale; y++) {
    for (let x = 0; x < src.width * scale; x++) {
      const s = (Math.floor(y / scale) * src.width + Math.floor(x / scale)) * 4
      const d = (y * dst.width + offsetX + x) * 4
      dst.data[d] = src.data[s]!
      dst.data[d + 1] = src.data[s + 1]!
      dst.data[d + 2] = src.data[s + 2]!
      dst.data[d + 3] = 255
    }
  }
}
