/** Low-bandwidth JPEG thumbnail from the recognition canvas. */

export const PREVIEW_MAX_WIDTH = 200
export const PREVIEW_JPEG_QUALITY = 0.4
/** Target ~2–3 fps; skip if encode/publish is slow. */
export const PREVIEW_INTERVAL_MS = 400

/**
 * Encode a downscaled JPEG as raw base64 (no data-URL prefix).
 * Uses sync toDataURL (reliable on iOS Safari); toBlob can hang/no-op.
 */
export function capturePreviewJpeg(
  source: HTMLCanvasElement,
  maxWidth = PREVIEW_MAX_WIDTH,
  quality = PREVIEW_JPEG_QUALITY,
): { data: string; w: number; h: number } | null {
  if (!source.width || !source.height) return null
  const scale = Math.min(1, maxWidth / source.width)
  const w = Math.max(1, Math.round(source.width * scale))
  const h = Math.max(1, Math.round(source.height * scale))
  const off = document.createElement('canvas')
  off.width = w
  off.height = h
  const ctx = off.getContext('2d')
  if (!ctx) return null
  try {
    ctx.drawImage(source, 0, 0, w, h)
    const dataUrl = off.toDataURL('image/jpeg', quality)
    const comma = dataUrl.indexOf(',')
    const data = comma >= 0 ? dataUrl.slice(comma + 1) : dataUrl
    if (!data || data.length < 32) return null
    return { data, w, h }
  } catch {
    return null
  }
}

export function previewDataUrl(mime: string, data: string): string {
  return `data:${mime};base64,${data}`
}
