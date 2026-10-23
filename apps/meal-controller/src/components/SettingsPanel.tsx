import { useState } from 'react'
import { DEFAULT_SETTINGS, type ControllerSettings } from '../lib/types'

type Props = {
  settings: ControllerSettings
  onChange: (next: ControllerSettings) => void
  habitualGapSec?: number
  effectivePauseSec?: number
}

function SliderRow({
  label,
  valueText,
  hint,
  min,
  max,
  step,
  value,
  onChange,
}: {
  label: string
  valueText: string
  hint?: string
  min: number
  max: number
  step: number
  value: number
  onChange: (v: number) => void
}) {
  return (
    <label className="slider-row">
      <span className="slider-label">
        <span>
          {label} <strong>{valueText}</strong>
        </span>
        {hint ? <span className="slider-hint">{hint}</span> : null}
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  )
}

export function SettingsPanel({
  settings,
  onChange,
  habitualGapSec = 0,
  effectivePauseSec,
}: Props) {
  const [advancedOpen, setAdvancedOpen] = useState(false)

  const set = <K extends keyof ControllerSettings>(
    key: K,
    value: ControllerSettings[K],
  ) => onChange({ ...settings, [key]: value })

  return (
    <section className="settings" aria-label="감지 설정">
      <div className="settings-head">
        <h3>기본 설정</h3>
        <button
          type="button"
          className="btn btn-tiny"
          onClick={() => onChange({ ...DEFAULT_SETTINGS })}
        >
          초기화
        </button>
      </div>

      <SliderRow
        label="일시정지 지연"
        valueText={`${settings.pauseDelaySec.toFixed(1)}초`}
        hint="저작이 멈춘 뒤 영상을 멈추기까지"
        min={1}
        max={8}
        step={0.1}
        value={settings.pauseDelaySec}
        onChange={(v) => set('pauseDelaySec', v)}
      />

      <SliderRow
        label="저작 민감도"
        valueText={`${Math.round(settings.sensitivity * 100)}%`}
        hint="높을수록 약한 턱 움직임도 저작으로 인식"
        min={0.2}
        max={0.95}
        step={0.01}
        value={settings.sensitivity}
        onChange={(v) => set('sensitivity', v)}
      />

      <SliderRow
        label="재개 저작 횟수"
        valueText={`${settings.resumeCycles}회`}
        hint="일시정지 후 재생에 필요한 씹기 주기"
        min={1}
        max={6}
        step={1}
        value={settings.resumeCycles}
        onChange={(v) => set('resumeCycles', v)}
      />

      <SliderRow
        label="무깜빡임 경고"
        valueText={`${settings.noBlinkWarnSec.toFixed(1)}초`}
        hint="깜빡임 없이 화면만 보면 건성안 알림"
        min={5}
        max={30}
        step={0.5}
        value={settings.noBlinkWarnSec}
        onChange={(v) => set('noBlinkWarnSec', v)}
      />

      <button
        type="button"
        className="advanced-toggle"
        aria-expanded={advancedOpen}
        onClick={() => setAdvancedOpen((o) => !o)}
      >
        세밀 설정 {advancedOpen ? '▾' : '▸'}
      </button>

      {advancedOpen && (
        <div className="advanced-block">
          <SliderRow
            label="진폭 임계값"
            valueText={settings.amplitudeThreshold.toFixed(3)}
            hint="턱 움직임 최소 크기 (낮을수록 민감)"
            min={0.02}
            max={0.25}
            step={0.005}
            value={settings.amplitudeThreshold}
            onChange={(v) => set('amplitudeThreshold', v)}
          />

          <SliderRow
            label="저작 주파수 최소"
            valueText={`${settings.freqMinHz.toFixed(2)} Hz`}
            hint={`주기 상한 ≈ ${(1000 / settings.freqMinHz).toFixed(0)} ms`}
            min={0.3}
            max={2.0}
            step={0.05}
            value={settings.freqMinHz}
            onChange={(v) => set('freqMinHz', v)}
          />

          <SliderRow
            label="저작 주파수 최대"
            valueText={`${settings.freqMaxHz.toFixed(2)} Hz`}
            hint={`주기 하한 ≈ ${(1000 / settings.freqMaxHz).toFixed(0)} ms`}
            min={0.8}
            max={4.0}
            step={0.05}
            value={settings.freqMaxHz}
            onChange={(v) => set('freqMaxHz', v)}
          />

          <SliderRow
            label="얼굴 소실 지연"
            valueText={`${settings.faceLostDelaySec.toFixed(1)}초`}
            hint="얼굴을 잃은 뒤 NO_FACE로 전환"
            min={0.3}
            max={3}
            step={0.1}
            value={settings.faceLostDelaySec}
            onChange={(v) => set('faceLostDelaySec', v)}
          />

          <SliderRow
            label="pause/play 디바운스"
            valueText={`${settings.debounceSec.toFixed(2)}초`}
            hint="전환 사이 최소 간격 (깜빡임 방지)"
            min={0.15}
            max={2}
            step={0.05}
            value={settings.debounceSec}
            onChange={(v) => set('debounceSec', v)}
          />

          <SliderRow
            label="습관 휴지 배수"
            valueText={`×${settings.habitualPauseMultiplier.toFixed(2)}`}
            hint={
              habitualGapSec > 0
                ? `측정된 저작 간격 ≈ ${habitualGapSec.toFixed(2)}초 · 실효 지연 ≈ ${(effectivePauseSec ?? settings.pauseDelaySec).toFixed(1)}초`
                : '1.0이면 고정 지연만 사용. 저작 간격이 쌓이면 배수×간격 적용'
            }
            min={0.5}
            max={2.5}
            step={0.05}
            value={settings.habitualPauseMultiplier}
            onChange={(v) => set('habitualPauseMultiplier', v)}
          />

          <label className="check-row advanced-check">
            <input
              type="checkbox"
              checked={settings.pauseOnDryEye}
              onChange={(e) => set('pauseOnDryEye', e.target.checked)}
            />
            건성안 알림 시 영상도 일시정지 (기본 꺼짐)
          </label>

          <details className="debug-details">
            <summary>개발자 디버그 (기본 숨김)</summary>
            <label className="check-row advanced-check">
              <input
                type="checkbox"
                checked={settings.showDebug}
                onChange={(e) => set('showDebug', e.target.checked)}
              />
              영상 HUD·수치 표시
            </label>
          </details>
        </div>
      )}
    </section>
  )
}
