/** Digital zoom / crop helpers for far-range face detection. */

export type CropRect = {
  sx: number
  sy: number
  sw: number
  sh: number
}

export type CropCenter = { cx: number; cy: number }

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n))
}

/** Axis-aligned crop of the full frame at `zoom`, centered on (cx, cy) in 0–1. */
export function computeCropRect(
  videoW: number,
  videoH: number,
  zoom: number,
  center: CropCenter,
): CropRect {
  const z = clamp(zoom, 1, 2.5)
  const sw = videoW / z
  const sh = videoH / z
  let sx = center.cx * videoW - sw / 2
  let sy = center.cy * videoH - sh / 2
  sx = clamp(sx, 0, Math.max(0, videoW - sw))
  sy = clamp(sy, 0, Math.max(0, videoH - sh))
  return { sx, sy, sw, sh }
}

/**
 * Process canvas size: keep crop pixels when possible; only downscale if larger
 * than `maxEdge` so MediaPipe still sees a large enough face.
 */
export function processSizeForCrop(
  crop: CropRect,
  maxEdge = 1280,
  minEdge = 480,
): { w: number; h: number } {
  const aspect = crop.sw / Math.max(1, crop.sh)
  let w = Math.round(crop.sw)
  let h = Math.round(crop.sh)
  const long = Math.max(w, h)
  if (long > maxEdge) {
    const scale = maxEdge / long
    w = Math.round(w * scale)
    h = Math.round(h * scale)
  }
  // Avoid tiny process buffers (hurts far faces)
  const short = Math.min(w, h)
  if (short < minEdge && long > 0) {
    const scale = minEdge / short
    // Don't upscale past source crop
    const capped = Math.min(scale, maxEdge / Math.max(w, h, 1))
    if (capped > 1.01) {
      w = Math.round(w * capped)
      h = Math.round(h * capped)
    }
  }
  // Keep aspect
  if (w >= h) {
    h = Math.max(1, Math.round(w / aspect))
  } else {
    w = Math.max(1, Math.round(h * aspect))
  }
  return { w: Math.max(1, w), h: Math.max(1, h) }
}

/** Mean landmark position in normalized crop space → full-frame 0–1 center. */
export function cropLocalToFullCenter(
  crop: CropRect,
  videoW: number,
  videoH: number,
  localX: number,
  localY: number,
): CropCenter {
  return {
    cx: clamp((crop.sx + localX * crop.sw) / videoW, 0, 1),
    cy: clamp((crop.sy + localY * crop.sh) / videoH, 0, 1),
  }
}

export function landmarksCentroid(
  landmarks: Array<{ x: number; y: number }>,
): CropCenter | null {
  if (!landmarks.length) return null
  let sx = 0
  let sy = 0
  for (const p of landmarks) {
    sx += p.x
    sy += p.y
  }
  const n = landmarks.length
  return { cx: sx / n, cy: sy / n }
}

/** EMA toward target; snaps faster when far. */
export function smoothCenter(
  current: CropCenter,
  target: CropCenter,
  alpha = 0.18,
): CropCenter {
  return {
    cx: current.cx + (target.cx - current.cx) * alpha,
    cy: current.cy + (target.cy - current.cy) * alpha,
  }
}
