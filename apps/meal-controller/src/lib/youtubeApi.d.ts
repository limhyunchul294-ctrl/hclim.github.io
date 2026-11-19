/** Minimal YouTube IFrame Player API typings used by this app. */

export type YtPlayer = {
  playVideo: () => void
  pauseVideo: () => void
  stopVideo: () => void
  destroy: () => void
  getPlayerState: () => number
  mute: () => void
  unMute: () => void
  isMuted: () => boolean
  setVolume: (volume: number) => void
  getVolume: () => number
  setPlaybackRate: (suggestedRate: number) => void
  getPlaybackRate: () => number
  getAvailablePlaybackRates: () => number[]
  seekTo: (seconds: number, allowSeekAhead: boolean) => void
  getCurrentTime: () => number
  getDuration: () => number
  /**
   * Deprecated / no-op since ~2019 — do not call for UX.
   * Kept optional so runtime never assumes it works.
   */
  setPlaybackQuality?: (suggestedQuality: string) => void
}

export type YtPlayerEvent = {
  data: number
  target: YtPlayer
}

declare global {
  interface Window {
    YT?: {
      Player: new (
        el: HTMLElement | string,
        opts: {
          videoId?: string
          width?: string | number
          height?: string | number
          playerVars?: Record<string, string | number>
          events?: {
            onReady?: (e: YtPlayerEvent) => void
            onStateChange?: (e: YtPlayerEvent) => void
            onError?: (e: YtPlayerEvent) => void
          }
        },
      ) => YtPlayer
      PlayerState: {
        UNSTARTED: number
        ENDED: number
        PLAYING: number
        PAUSED: number
        BUFFERING: number
        CUED: number
      }
    }
    onYouTubeIframeAPIReady?: () => void
  }
}

export {}
