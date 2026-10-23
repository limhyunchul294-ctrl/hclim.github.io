import { useEffect, useState } from 'react'

type NavigatorStandalone = Navigator & { standalone?: boolean }

/** True when launched from Home Screen / installed PWA (no Safari chrome). */
export function useStandaloneDisplay(): boolean {
  const [standalone, setStandalone] = useState(() => readStandalone())

  useEffect(() => {
    setStandalone(readStandalone())
    const mq = window.matchMedia('(display-mode: standalone)')
    const onChange = () => setStandalone(readStandalone())
    mq.addEventListener?.('change', onChange)
    // iOS may not fire display-mode change; re-check on resume
    const onVis = () => setStandalone(readStandalone())
    document.addEventListener('visibilitychange', onVis)
    return () => {
      mq.removeEventListener?.('change', onChange)
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [])

  return standalone
}

function readStandalone(): boolean {
  if (typeof window === 'undefined') return false
  const nav = navigator as NavigatorStandalone
  if (nav.standalone === true) return true
  try {
    if (window.matchMedia('(display-mode: standalone)').matches) return true
    if (window.matchMedia('(display-mode: fullscreen)').matches) return true
  } catch {
    /* ignore */
  }
  return false
}
