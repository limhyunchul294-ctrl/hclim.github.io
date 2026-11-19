/** Parent-facing YouTube media knobs that the IFrame API still honors. */

export type YtMediaState = {
  /** 0–100 (YouTube setVolume). iOS may ignore — hardware volume only. */
  volume: number
  muted: boolean
  /** Suggested rate; player may snap to nearest supported. */
  playbackRate: number
  /**
   * Bumps whenever the parent asks for a relative seek.
   * Viewer/combined apply seek when this changes.
   */
  seekSeq: number
  /** Seconds to add to current time when seekSeq changes (e.g. ±10). */
  seekDeltaSec: number
}

export const DEFAULT_YT_MEDIA: YtMediaState = {
  volume: 80,
  muted: false,
  playbackRate: 1,
  seekSeq: 0,
  seekDeltaSec: 0,
}

/** Common rates parents expect; actual availability is per-video. */
export const YT_RATE_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5] as const

export function clampVolume(n: number): number {
  if (!Number.isFinite(n)) return DEFAULT_YT_MEDIA.volume
  return Math.max(0, Math.min(100, Math.round(n)))
}

export function normalizeYtMedia(
  partial: Partial<YtMediaState> | null | undefined,
): YtMediaState {
  if (!partial) return { ...DEFAULT_YT_MEDIA }
  const rate = Number(partial.playbackRate)
  return {
    volume: clampVolume(Number(partial.volume ?? DEFAULT_YT_MEDIA.volume)),
    muted: Boolean(partial.muted),
    playbackRate: YT_RATE_OPTIONS.includes(rate as (typeof YT_RATE_OPTIONS)[number])
      ? rate
      : DEFAULT_YT_MEDIA.playbackRate,
    seekSeq:
      typeof partial.seekSeq === 'number' && Number.isFinite(partial.seekSeq)
        ? partial.seekSeq
        : 0,
    seekDeltaSec:
      typeof partial.seekDeltaSec === 'number' &&
      Number.isFinite(partial.seekDeltaSec)
        ? partial.seekDeltaSec
        : 0,
  }
}
