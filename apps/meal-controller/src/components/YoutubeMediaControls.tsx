import { isIOSLike } from '../lib/fullscreen'
import {
  YT_RATE_OPTIONS,
  type YtMediaState,
} from '../lib/ytMedia'

type Props = {
  media: YtMediaState
  onChange: (next: YtMediaState) => void
  /** Phone → TV: emphasize remote effect. */
  remoteHint?: boolean
  disabled?: boolean
}

/**
 * Parent knobs for what the YouTube IFrame API still allows.
 * Quality is intentionally not offered — API is a no-op since ~2019.
 */
export function YoutubeMediaControls({
  media,
  onChange,
  remoteHint = false,
  disabled = false,
}: Props) {
  const ios = isIOSLike()

  const set = (patch: Partial<YtMediaState>) => {
    onChange({ ...media, ...patch })
  }

  const seekBy = (delta: number) => {
    onChange({
      ...media,
      seekSeq: media.seekSeq + 1,
      seekDeltaSec: delta,
    })
  }

  return (
    <section
      className="yt-media-controls"
      aria-label="유튜브 소리·배속"
      aria-disabled={disabled}
    >
      <h3>유튜브 조작</h3>
      <p className="yt-media-lead">
        {remoteHint
          ? '소리·배속·건너뛰기는 TV(영상 화면)로 보내요.'
          : '소리·배속·건너뛰기를 이 화면 영상에 바로 적용해요.'}
      </p>

      <div className="yt-media-row">
        <button
          type="button"
          className="btn yt-media-btn"
          disabled={disabled}
          aria-pressed={media.muted}
          onClick={() => set({ muted: !media.muted })}
        >
          {media.muted ? '소리 켜기' : '음소거'}
        </button>
        <button
          type="button"
          className="btn yt-media-btn"
          disabled={disabled}
          onClick={() => seekBy(-10)}
        >
          10초 뒤로
        </button>
        <button
          type="button"
          className="btn yt-media-btn"
          disabled={disabled}
          onClick={() => seekBy(10)}
        >
          10초 앞으로
        </button>
      </div>

      <label className={`slider-row ${disabled ? 'is-disabled' : ''}`}>
        <span className="slider-label">
          <span>
            음량 <strong>{media.muted ? '음소거' : `${media.volume}`}</strong>
          </span>
          <span className="slider-hint">
            {ios
              ? '아이폰·아이패드에서는 기기 옆면 음량 버튼이 우선이에요. 앱 슬라이더는 안 먹을 수 있어요.'
              : '0~100 · 유튜브 플레이어 음량'}
          </span>
        </span>
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={media.volume}
          disabled={disabled || media.muted}
          onChange={(e) => set({ volume: Number(e.target.value), muted: false })}
        />
      </label>

      <div className="yt-rate-block" role="group" aria-label="배속">
        <p className="yt-rate-label">
          배속 <strong>{media.playbackRate}×</strong>
        </p>
        <div className="yt-rate-tabs">
          {YT_RATE_OPTIONS.map((rate) => (
            <button
              key={rate}
              type="button"
              className={`btn yt-rate-btn ${media.playbackRate === rate ? 'primary' : ''}`}
              aria-pressed={media.playbackRate === rate}
              disabled={disabled}
              onClick={() => set({ playbackRate: rate })}
            >
              {rate}×
            </button>
          ))}
        </div>
      </div>

      <div className="yt-quality-note" role="note">
        <p className="yt-quality-title">화질</p>
        <p className="yt-quality-body">
          화질은 유튜브가 네트워크·기기에 맞춰 <strong>자동</strong>으로
          골라요. 앱에서는 바꿀 수 없어요(유튜브가 예전에 막아 두었어요).
        </p>
      </div>
    </section>
  )
}
