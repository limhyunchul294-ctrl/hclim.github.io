type FsElement = HTMLElement & {
  webkitRequestFullscreen?: () => Promise<void> | void
  webkitRequestFullScreen?: () => Promise<void> | void
}

type FsDocument = Document & {
  webkitFullscreenElement?: Element | null
  webkitExitFullscreen?: () => Promise<void> | void
  webkitCancelFullScreen?: () => Promise<void> | void
}

export function getFullscreenElement(): Element | null {
  const doc = document as FsDocument
  return document.fullscreenElement ?? doc.webkitFullscreenElement ?? null
}

export async function requestAppFullscreen(el: HTMLElement): Promise<void> {
  const node = el as FsElement
  if (node.requestFullscreen) {
    await node.requestFullscreen()
    return
  }
  if (node.webkitRequestFullscreen) {
    await node.webkitRequestFullscreen()
    return
  }
  if (node.webkitRequestFullScreen) {
    await node.webkitRequestFullScreen()
  }
}

export async function exitAppFullscreen(): Promise<void> {
  const doc = document as FsDocument
  if (document.exitFullscreen && getFullscreenElement()) {
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
}

export function onFullscreenChange(handler: () => void): () => void {
  document.addEventListener('fullscreenchange', handler)
  document.addEventListener('webkitfullscreenchange', handler)
  return () => {
    document.removeEventListener('fullscreenchange', handler)
    document.removeEventListener('webkitfullscreenchange', handler)
  }
}
