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

/** Parent-facing fine controls — collapsed by default for toddlers. */
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
    <section className="settings" aria-label="부모님 설정">
      <button
        type="button"
        className="advanced-toggle"
        aria-expanded={advancedOpen}
        onClick={() => setAdvancedOpen((o) => !o)}
      >
        세밀 설정 (부모님용) {advancedOpen ? '▾' : '▸'}
      </button>

      {advancedOpen && (
        <div className="advanced-block">
          <div className="settings-head">
            <h3>감지 조절</h3>
            <button
              type="button"
              className="btn btn-tiny"
              onClick={() =>
                onChange({
                  ...DEFAULT_SETTINGS,
                  faceMode: settings.faceMode,
                  showRecognitionPreview: settings.showRecognitionPreview,
                })
              }
            >
              초기화
            </button>
          </div>

          <SliderRow
            label="멈춤까지 기다리는 시간"
            valueText={`${settings.pauseDelaySec.toFixed(1)}초`}
            hint="씹기를 멈춘 뒤 영상이 멈출 때까지"
            min={1}
            max={8}
            step={0.1}
            value={settings.pauseDelaySec}
            onChange={(v) => set('pauseDelaySec', v)}
          />

          <SliderRow
            label="씹기 민감도"
            valueText={`${Math.round(settings.sensitivity * 100)}%`}
            hint="높을수록 작은 움직임도 씹기로 봐요"
            min={0.2}
            max={0.95}
            step={0.01}
            value={settings.sensitivity}
            onChange={(v) => set('sensitivity', v)}
          />

          <SliderRow
            label="다시 보기 씹기 횟수"
            valueText={`${settings.resumeCycles}회`}
            hint="멈춘 뒤 재생에 필요한 씹기"
            min={1}
            max={6}
            step={1}
            value={settings.resumeCycles}
            onChange={(v) => set('resumeCycles', v)}
          />

          <SliderRow
            label="깜빡임 알림"
            valueText={`${settings.noBlinkWarnSec.toFixed(1)}초`}
            hint="오래 안 깜빡이면 알려요"
            min={5}
            max={30}
            step={0.5}
            value={settings.noBlinkWarnSec}
            onChange={(v) => set('noBlinkWarnSec', v)}
          />

          <SliderRow
            label="진폭 임계값"
            valueText={settings.amplitudeThreshold.toFixed(3)}
            hint="턱 움직임 최소 크기"
            min={0.02}
            max={0.25}
            step={0.005}
            value={settings.amplitudeThreshold}
            onChange={(v) => set('amplitudeThreshold', v)}
          />

          <SliderRow
            label="저작 주파수 최소"
            valueText={`${settings.freqMinHz.toFixed(2)} Hz`}
            min={0.3}
            max={2.0}
            step={0.05}
            value={settings.freqMinHz}
            onChange={(v) => set('freqMinHz', v)}
          />

          <SliderRow
            label="저작 주파수 최대"
            valueText={`${settings.freqMaxHz.toFixed(2)} Hz`}
            min={0.8}
            max={4.0}
            step={0.05}
            value={settings.freqMaxHz}
            onChange={(v) => set('freqMaxHz', v)}
          />

          <SliderRow
            label="얼굴 사라짐 지연"
            valueText={`${settings.faceLostDelaySec.toFixed(1)}초`}
            min={0.3}
            max={3}
            step={0.1}
            value={settings.faceLostDelaySec}
            onChange={(v) => set('faceLostDelaySec', v)}
          />

          <SliderRow
            label="전환 간격"
            valueText={`${settings.debounceSec.toFixed(2)}초`}
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
                ? `측정 간격 ≈ ${habitualGapSec.toFixed(2)}초 · 실효 ≈ ${(effectivePauseSec ?? settings.pauseDelaySec).toFixed(1)}초`
                : '1.0이면 고정 시간만 사용'
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
            깜빡임 알림 때 영상도 멈춤
          </label>

          <label className="check-row advanced-check">
            <input
              type="checkbox"
              checked={settings.showMesh}
              onChange={(e) => set('showMesh', e.target.checked)}
            />
            얼굴 선 그리기
          </label>

          <details className="debug-details">
            <summary>개발자 디버그</summary>
            <label className="check-row advanced-check">
              <input
                type="checkbox"
                checked={settings.showDebug}
                onChange={(e) => set('showDebug', e.target.checked)}
              />
              영상 위 숫자 보기
            </label>
          </details>
        </div>
      )}
    </section>
  )
}
