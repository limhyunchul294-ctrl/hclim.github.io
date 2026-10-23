import { useEffect, useState } from 'react'

let loadPromise: Promise<void> | null = null

function loadYouTubeIframeApi(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve()
  if (window.YT?.Player) return Promise.resolve()
  if (loadPromise) return loadPromise

  loadPromise = new Promise((resolve) => {
    const prev = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => {
      prev?.()
      resolve()
    }
    if (document.querySelector('script[data-yt-iframe-api]')) return
    const tag = document.createElement('script')
    tag.src = 'https://www.youtube.com/iframe_api'
    tag.async = true
    tag.dataset.ytIframeApi = '1'
    document.head.appendChild(tag)
  })
  return loadPromise
}

export function useYouTubeApiReady(): boolean {
  const [ready, setReady] = useState(() => Boolean(window.YT?.Player))

  useEffect(() => {
    let cancelled = false
    void loadYouTubeIframeApi().then(() => {
      if (!cancelled) setReady(true)
    })
    return () => {
      cancelled = true
    }
  }, [])

  return ready
}
