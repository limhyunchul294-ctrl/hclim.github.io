type FsElement = HTMLElement & {
  webkitRequestFullscreen?: () => Promise<void> | void
  webkitRequestFullScreen?: () => Promise<void> | void
}

type FsDocument = Document & {
  webkitFullscreenElement?: Element | null
  webkitExitFullscreen?: () => Promise<void> | void
  webkitCancelFullScreen?: () => Promise<void> | void
}

/** iPhone/iPad Safari generally cannot fullscreen arbitrary HTML elements. */
export function isIOSLike(): boolean {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent || ''
  if (/iPad|iPhone|iPod/i.test(ua)) return true
  // iPadOS desktop UA
  return navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1
}

export function hasFullscreenApi(el?: HTMLElement | null): boolean {
  if (!el) return typeof document !== 'undefined' && 'fullscreenEnabled' in document
  const node = el as FsElement
  return Boolean(
    node.requestFullscreen ||
      node.webkitRequestFullscreen ||
      node.webkitRequestFullScreen,
  )
}

export function getFullscreenElement(): Element | null {
  const doc = document as FsDocument
  return document.fullscreenElement ?? doc.webkitFullscreenElement ?? null
}

export async function requestAppFullscreen(el: HTMLElement): Promise<boolean> {
  const node = el as FsElement
  try {
    if (node.requestFullscreen) {
      await node.requestFullscreen()
    } else if (node.webkitRequestFullscreen) {
      await node.webkitRequestFullscreen()
    } else if (node.webkitRequestFullScreen) {
      await node.webkitRequestFullScreen()
    } else {
      return false
    }
  } catch {
    return false
  }
  // Some engines resolve without actually entering FS (common on iOS).
  await new Promise<void>((r) => requestAnimationFrame(() => r()))
  return getFullscreenElement() === el
}

export async function exitAppFullscreen(): Promise<void> {
  if (!getFullscreenElement()) return
  const doc = document as FsDocument
  try {
    if (document.exitFullscreen) {
      await document.exitFullscreen()
      return
    }
    if (doc.webkitExitFullscreen) {
      await doc.webkitExitFullscreen()
      return
    }
    if (doc.webkitCancelFullScreen) {
      await doc.webkitCancelFullScreen()
    }
  } catch {
    /* ignore */
  }
}

export function onFullscreenChange(handler: () => void): () => void {
  document.addEventListener('fullscreenchange', handler)
  document.addEventListener('webkitfullscreenchange', handler)
  return () => {
    document.removeEventListener('fullscreenchange', handler)
    document.removeEventListener('webkitfullscreenchange', handler)
  }
}
