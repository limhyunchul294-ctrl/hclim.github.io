import type { ControllerSettings } from '../lib/types'

type Props = {
  settings: ControllerSettings
  onChange: (next: ControllerSettings) => void
}

export function SettingsPanel({ settings, onChange }: Props) {
  const set = <K extends keyof ControllerSettings>(
    key: K,
    value: ControllerSettings[K],
  ) => onChange({ ...settings, [key]: value })

  return (
    <section className="settings" aria-label="감지 설정">
      <h3>설정</h3>

      <label className="slider-row">
        <span>
          일시정지 지연 <strong>{settings.pauseDelaySec.toFixed(1)}초</strong>
        </span>
        <input
          type="range"
          min={2}
          max={6}
          step={0.5}
          value={settings.pauseDelaySec}
          onChange={(e) => set('pauseDelaySec', Number(e.target.value))}
        />
      </label>

      <label className="slider-row">
        <span>
          저작 민감도 <strong>{Math.round(settings.sensitivity * 100)}%</strong>
        </span>
        <input
          type="range"
          min={0.25}
          max={0.9}
          step={0.05}
          value={settings.sensitivity}
          onChange={(e) => set('sensitivity', Number(e.target.value))}
        />
      </label>

      <label className="slider-row">
        <span>
          재개에 필요한 저작 횟수 <strong>{settings.resumeCycles}</strong>
        </span>
        <input
          type="range"
          min={1}
          max={4}
          step={1}
          value={settings.resumeCycles}
          onChange={(e) => set('resumeCycles', Number(e.target.value))}
        />
      </label>

      <label className="slider-row">
        <span>
          눈 감김 경고 <strong>{settings.eyesClosedWarnSec.toFixed(1)}초</strong>
        </span>
        <input
          type="range"
          min={1}
          max={5}
          step={0.5}
          value={settings.eyesClosedWarnSec}
          onChange={(e) => set('eyesClosedWarnSec', Number(e.target.value))}
        />
      </label>
    </section>
  )
}
