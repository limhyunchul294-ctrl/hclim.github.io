/** Open a front-facing webcam with the highest practical resolution. */

export type CameraOpenResult = {
  stream: MediaStream
  width: number
  height: number
  deviceLabel: string
  /** Which constraint tier succeeded (for status / debug). */
  tier: string
}

function isCoarseOrMobile(): boolean {
  if (typeof window === 'undefined') return false
  const ua = navigator.userAgent || ''
  return (
    window.matchMedia('(pointer: coarse)').matches ||
    window.matchMedia('(max-width: 900px)').matches ||
    /iPhone|iPad|iPod|Android/i.test(ua)
  )
}

type VideoAttempt = {
  tier: string
  constraints: MediaTrackConstraints | true
}

function desktopAttempts(): VideoAttempt[] {
  return [
    {
      tier: '1080p',
      constraints: {
        facingMode: { ideal: 'user' },
        width: { ideal: 1920 },
        height: { ideal: 1080 },
        frameRate: { ideal: 30 },
      },
    },
    {
      tier: '720p',
      constraints: {
        facingMode: { ideal: 'user' },
        width: { ideal: 1280 },
        height: { ideal: 720 },
        frameRate: { ideal: 30 },
      },
    },
    {
      tier: '480p',
      constraints: {
        facingMode: { ideal: 'user' },
        width: { ideal: 640 },
        height: { ideal: 480 },
      },
    },
    { tier: 'any', constraints: { facingMode: { ideal: 'user' } } },
    { tier: 'fallback', constraints: true },
  ]
}

function mobileAttempts(): VideoAttempt[] {
  return [
    {
      tier: '720p-user',
      constraints: {
        facingMode: { ideal: 'user' },
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
    },
    {
      tier: '480p-user',
      constraints: {
        facingMode: { ideal: 'user' },
        width: { ideal: 640 },
        height: { ideal: 480 },
      },
    },
    { tier: 'user', constraints: { facingMode: { ideal: 'user' } } },
    { tier: 'fallback', constraints: true },
  ]
}

async function tryGetUserMedia(
  video: MediaTrackConstraints | true,
): Promise<MediaStream> {
  return navigator.mediaDevices.getUserMedia({
    audio: false,
    video,
  })
}

/** Prefer front / FaceTime-like labels; fall back to first videoinput. */
function pickFrontDeviceId(devices: MediaDeviceInfo[]): string | undefined {
  const videos = devices.filter((d) => d.kind === 'videoinput' && d.deviceId)
  if (!videos.length) return undefined
  const scored = videos.map((d) => {
    const label = (d.label || '').toLowerCase()
    let score = 0
    if (/front|user|face|facetime|전면/.test(label)) score += 5
    if (/back|rear|environment|후면|world/.test(label)) score -= 5
    return { id: d.deviceId, label: d.label, score }
  })
  scored.sort((a, b) => b.score - a.score)
  return scored[0]?.id
}

/**
 * After a stream is open, try switching to a device that advertises a higher
 * max width (desktop only). Keeps facingMode preference when possible.
 */
async function maybeUpgradeDevice(
  current: MediaStream,
  mobile: boolean,
): Promise<{ stream: MediaStream; label: string } | null> {
  if (mobile || !navigator.mediaDevices.enumerateDevices) return null
  const track = current.getVideoTracks()[0]
  if (!track) return null
  const curSettings = track.getSettings()
  const curW = curSettings.width ?? 0

  let devices: MediaDeviceInfo[]
  try {
    devices = await navigator.mediaDevices.enumerateDevices()
  } catch {
    return null
  }

  const frontId = pickFrontDeviceId(devices)
  const candidates = devices.filter((d) => d.kind === 'videoinput' && d.deviceId)
  let best: { id: string; label: string; maxW: number } | null = null

  for (const d of candidates) {
    const label = (d.label || '').toLowerCase()
    if (/back|rear|environment|후면|world/.test(label)) continue
    if (
      frontId &&
      d.deviceId !== frontId &&
      label &&
      !/front|user|face|facetime|전면/.test(label)
    ) {
      continue
    }
    if (!best) {
      best = { id: d.deviceId, label: d.label || 'camera', maxW: 1920 }
    }
  }

  if (!best || best.id === curSettings.deviceId) return null
  if (curW >= 1280) return null // already high enough

  try {
    const upgraded = await tryGetUserMedia({
      deviceId: { exact: best.id },
      width: { ideal: 1920 },
      height: { ideal: 1080 },
    })
    const w = upgraded.getVideoTracks()[0]?.getSettings().width ?? 0
    if (w <= curW) {
      upgraded.getTracks().forEach((t) => t.stop())
      return null
    }
    return { stream: upgraded, label: best.label }
  } catch {
    return null
  }
}

function readTrackSize(stream: MediaStream): {
  width: number
  height: number
  label: string
} {
  const track = stream.getVideoTracks()[0]
  const s = track?.getSettings() ?? {}
  return {
    width: s.width ?? 0,
    height: s.height ?? 0,
    label: track?.label || 'camera',
  }
}

/** Open camera with graceful resolution fallback (mobile stays lighter). */
export async function openCameraStream(): Promise<CameraOpenResult> {
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error('이 브라우저는 카메라를 지원하지 않습니다.')
  }

  const mobile = isCoarseOrMobile()
  const attempts = mobile ? mobileAttempts() : desktopAttempts()
  let lastErr: unknown

  for (const attempt of attempts) {
    try {
      let stream = await tryGetUserMedia(attempt.constraints)
      let tier = attempt.tier
      let meta = readTrackSize(stream)

      const upgraded = await maybeUpgradeDevice(stream, mobile)
      if (upgraded) {
        stream.getTracks().forEach((t) => t.stop())
        stream = upgraded.stream
        meta = readTrackSize(stream)
        tier = `${tier}+device`
      }

      return {
        stream,
        width: meta.width,
        height: meta.height,
        deviceLabel: meta.label,
        tier,
      }
    } catch (err) {
      lastErr = err
    }
  }

  throw lastErr instanceof Error
    ? lastErr
    : new Error('카메라를 열 수 없습니다.')
}

export { isCoarseOrMobile }
