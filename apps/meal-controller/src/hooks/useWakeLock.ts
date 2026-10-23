import { useEffect, useRef } from 'react'

/**
 * Keep the screen awake during a meal session (optional; no-op if unsupported).
 */
export function useWakeLock(active: boolean): void {
  const lockRef = useRef<WakeLockSentinel | null>(null)

  useEffect(() => {
    if (!active || typeof navigator === 'undefined' || !navigator.wakeLock) {
      return
    }

    let cancelled = false

    const request = async () => {
      try {
        const lock = await navigator.wakeLock.request('screen')
        if (cancelled) {
          void lock.release()
          return
        }
        lockRef.current = lock
        lock.addEventListener('release', () => {
          if (lockRef.current === lock) lockRef.current = null
        })
      } catch {
        /* permission / unsupported */
      }
    }

    void request()

    const onVis = () => {
      if (document.visibilityState === 'visible' && active) void request()
    }
    document.addEventListener('visibilitychange', onVis)

    return () => {
      cancelled = true
      document.removeEventListener('visibilitychange', onVis)
      const lock = lockRef.current
      lockRef.current = null
      if (lock) void lock.release().catch(() => {})
    }
  }, [active])
}
