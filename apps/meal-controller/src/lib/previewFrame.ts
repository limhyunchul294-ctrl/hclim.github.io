/** Low-bandwidth JPEG thumbnail from the recognition canvas. */

export const PREVIEW_MAX_WIDTH = 240
export const PREVIEW_JPEG_QUALITY = 0.42
/** Target ~3 fps; skip if encode/publish is slow. */
export const PREVIEW_INTERVAL_MS = 333

/**
 * Encode a downscaled JPEG as raw base64 (no data-URL prefix).
 * Returns null if the canvas is empty or encode fails.
 */
export function capturePreviewJpeg(
  source: HTMLCanvasElement,
  maxWidth = PREVIEW_MAX_WIDTH,
  quality = PREVIEW_JPEG_QUALITY,
): Promise<{ data: string; w: number; h: number } | null> {
  return new Promise((resolve) => {
    if (!source.width || !source.height) {
      resolve(null)
      return
    }
    const scale = Math.min(1, maxWidth / source.width)
    const w = Math.max(1, Math.round(source.width * scale))
    const h = Math.max(1, Math.round(source.height * scale))
    const off = document.createElement('canvas')
    off.width = w
    off.height = h
    const ctx = off.getContext('2d')
    if (!ctx) {
      resolve(null)
      return
    }
    ctx.drawImage(source, 0, 0, w, h)
    try {
      off.toBlob(
        (blob) => {
          if (!blob) {
            resolve(null)
            return
          }
          const reader = new FileReader()
          reader.onload = () => {
            const result = reader.result
            if (typeof result !== 'string') {
              resolve(null)
              return
            }
            const comma = result.indexOf(',')
            const data = comma >= 0 ? result.slice(comma + 1) : result
            resolve({ data, w, h })
          }
          reader.onerror = () => resolve(null)
          reader.readAsDataURL(blob)
        },
        'image/jpeg',
        quality,
      )
    } catch {
      resolve(null)
    }
  })
}

export function previewDataUrl(mime: string, data: string): string {
  return `data:${mime};base64,${data}`
}
