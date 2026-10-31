import { useEffect } from 'react'

export function useScreenWakeLock(): void {
  useEffect(() => {
    let sentinel: WakeLockSentinel | null = null

    const acquire = async () => {
      if (!('wakeLock' in navigator)) return
      if (document.visibilityState !== 'visible') return
      if (sentinel && !sentinel.released) return
      try {
        sentinel = await navigator.wakeLock.request('screen')
        sentinel.addEventListener('release', () => {
          sentinel = null
        })
      } catch {
        sentinel = null
      }
    }

    void acquire()
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') void acquire()
    }
    document.addEventListener('visibilitychange', onVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange)
      if (sentinel && !sentinel.released) void sentinel.release().catch(() => undefined)
      sentinel = null
    }
  }, [])
}
