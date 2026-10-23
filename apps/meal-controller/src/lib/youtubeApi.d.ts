/** Minimal YouTube IFrame Player API typings used by this app. */

export type YtPlayer = {
  playVideo: () => void
  pauseVideo: () => void
  stopVideo: () => void
  destroy: () => void
  getPlayerState: () => number
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
