import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { FaceLandmarker } from '@mediapipe/tasks-vision'
import {
  computeCropRect,
  cropLocalToFullCenter,
  landmarksCentroid,
  processSizeForCrop,
  smoothCenter,
  type CropCenter,
} from '../lib/cameraCrop'
import { openCameraStream } from '../lib/cameraStream'
import {
  createFaceLandmarker,
  extractFaceSignals,
} from '../lib/faceLandmarker'
import { drawFaceMesh } from '../lib/drawMesh'
import type { FaceFrame } from '../lib/types'

type Options = {
  showMesh: boolean
  /** Digital zoom 1.0–2.5 (parent slider). */
  cameraZoom: number
  onFrame: (frame: FaceFrame) => void
  enabled: boolean
}

type Status =
  | { kind: 'idle' }
  | { kind: 'loading'; message: string }
  | { kind: 'ready' }
  | { kind: 'error'; message: string }

export type StreamInfo = {
  width: number
  height: number
  deviceLabel: string
  tier: string
  /** Effective zoom applied this frame. */
  zoom: number
}

/** ~15 FPS on phones/tablets; ~24 FPS on desktop — less jank with YouTube. */
function detectIntervalMs(): number {
  if (typeof window === 'undefined') return 66
  const coarse =
    window.matchMedia('(pointer: coarse)').matches ||
    window.matchMedia('(max-width: 1024px)').matches
  return coarse ? 66 : 42
}

export function useCameraLandmarker({
  showMesh,
  cameraZoom,
  onFrame,
  enabled,
}: Options) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const landmarkerRef = useRef<FaceLandmarker | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const rafRef = useRef<number>(0)
  const lastTsRef = useRef<number>(-1)
  const runningRef = useRef(false)
  const onFrameRef = useRef(onFrame)
  const showMeshRef = useRef(showMesh)
  const zoomRef = useRef(cameraZoom)
  const cropCenterRef = useRef<CropCenter>({ cx: 0.5, cy: 0.5 })
  const intervalRef = useRef(detectIntervalMs())

  const [status, setStatus] = useState<Status>({ kind: 'idle' })
  const [faceLost, setFaceLost] = useState(false)
  const [faceCount, setFaceCount] = useState(0)
  const [streamInfo, setStreamInfo] = useState<StreamInfo | null>(null)

  useEffect(() => {
    onFrameRef.current = onFrame
  }, [onFrame])

  useEffect(() => {
    showMeshRef.current = showMesh
  }, [showMesh])

  useEffect(() => {
    zoomRef.current = Math.min(2.5, Math.max(1, cameraZoom))
  }, [cameraZoom])

  useEffect(() => {
    const update = () => {
      intervalRef.current = detectIntervalMs()
    }
    update()
    const mq = window.matchMedia('(pointer: coarse)')
    mq.addEventListener?.('change', update)
    window.addEventListener('resize', update)
    return () => {
      mq.removeEventListener?.('change', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  const stop = useCallback(() => {
    runningRef.current = false
    cancelAnimationFrame(rafRef.current)
    rafRef.current = 0
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    landmarkerRef.current?.close()
    landmarkerRef.current = null
    lastTsRef.current = -1
    cropCenterRef.current = { cx: 0.5, cy: 0.5 }
    setFaceCount(0)
    setStreamInfo(null)
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }, [])

  const loop = useCallback(() => {
    if (!runningRef.current) return
    const video = videoRef.current
    const canvas = canvasRef.current
    const landmarker = landmarkerRef.current

    if (video && canvas && landmarker && video.readyState >= 2) {
      const now = performance.now()
      if (now > lastTsRef.current + intervalRef.current) {
        lastTsRef.current = now
        try {
          const vw = video.videoWidth || 640
          const vh = video.videoHeight || 480
          const zoom = zoomRef.current
          const crop = computeCropRect(vw, vh, zoom, cropCenterRef.current)
          const { w: pw, h: ph } = processSizeForCrop(crop)

          const ctx = canvas.getContext('2d')
          if (!ctx) throw new Error('2d context missing')

          if (canvas.width !== pw || canvas.height !== ph) {
            canvas.width = pw
            canvas.height = ph
          }

          // Draw zoomed crop — MediaPipe + preview share this buffer (no over-shrink)
          ctx.drawImage(
            video,
            crop.sx,
            crop.sy,
            crop.sw,
            crop.sh,
            0,
            0,
            pw,
            ph,
          )

          const result = landmarker.detectForVideo(canvas, now)
          const frame = extractFaceSignals(result, now)
          setFaceLost(!frame.hasFace)
          setFaceCount(frame.faceCount)
          onFrameRef.current(frame)

          // Face-follow: steer crop center in full-frame space
          if (frame.hasFace && result.faceLandmarks?.length) {
            const centers = result.faceLandmarks
              .map((lm) => landmarksCentroid(lm))
              .filter((c): c is CropCenter => c != null)
            if (centers.length) {
              const mid = {
                cx: centers.reduce((a, c) => a + c.cx, 0) / centers.length,
                cy: centers.reduce((a, c) => a + c.cy, 0) / centers.length,
              }
              const target = cropLocalToFullCenter(crop, vw, vh, mid.cx, mid.cy)
              cropCenterRef.current = smoothCenter(
                cropCenterRef.current,
                target,
                0.2,
              )
            }
          } else {
            // Drift back to frame center when hunting for a face
            cropCenterRef.current = smoothCenter(
              cropCenterRef.current,
              { cx: 0.5, cy: 0.5 },
              0.08,
            )
          }

          if (showMeshRef.current && result.faceLandmarks?.length) {
            for (const lm of result.faceLandmarks) {
              drawFaceMesh(ctx, lm)
            }
          }

          setStreamInfo((prev) => {
            const next: StreamInfo = {
              width: vw,
              height: vh,
              deviceLabel: prev?.deviceLabel ?? '',
              tier: prev?.tier ?? '',
              zoom,
            }
            if (
              prev &&
              prev.width === next.width &&
              prev.height === next.height &&
              prev.zoom === next.zoom
            ) {
              return prev
            }
            return { ...prev, ...next, deviceLabel: prev?.deviceLabel ?? '', tier: prev?.tier ?? '' }
          })
        } catch (err) {
          console.warn('detectForVideo failed', err)
        }
      }
    }
    rafRef.current = requestAnimationFrame(loop)
  }, [])

  const start = useCallback(async () => {
    stop()
    setStatus({ kind: 'loading', message: '카메라 준비 중…' })
    try {
      const landmarker = await createFaceLandmarker()
      landmarkerRef.current = landmarker

      const opened = await openCameraStream()
      streamRef.current = opened.stream
      setStreamInfo({
        width: opened.width,
        height: opened.height,
        deviceLabel: opened.deviceLabel,
        tier: opened.tier,
        zoom: zoomRef.current,
      })

      const video = videoRef.current
      if (!video) throw new Error('video element missing')
      video.setAttribute('playsinline', 'true')
      video.setAttribute('webkit-playsinline', 'true')
      video.muted = true
      video.srcObject = opened.stream
      await video.play()

      // Prefer track settings once metadata is ready
      const applySize = () => {
        const vw = video.videoWidth
        const vh = video.videoHeight
        if (vw && vh) {
          setStreamInfo((prev) =>
            prev
              ? { ...prev, width: vw, height: vh }
              : {
                  width: vw,
                  height: vh,
                  deviceLabel: opened.deviceLabel,
                  tier: opened.tier,
                  zoom: zoomRef.current,
                },
          )
        }
      }
      if (video.readyState >= 2) applySize()
      else video.addEventListener('loadedmetadata', applySize, { once: true })

      setStatus({ kind: 'ready' })
      runningRef.current = true
      lastTsRef.current = -1
      cropCenterRef.current = { cx: 0.5, cy: 0.5 }
      rafRef.current = requestAnimationFrame(loop)
    } catch (err) {
      stop()
      const raw =
        err instanceof Error
          ? err.message
          : '카메라 또는 모델 로드에 실패했습니다.'
      let message = raw
      if (/NotAllowed|Permission|permission/i.test(raw)) {
        message =
          '카메라 권한이 거부되었습니다. 설정에서 카메라를 허용해 주세요.'
      } else if (/NotFound|DevicesNotFound|Requested device/i.test(raw)) {
        message =
          '전면 카메라를 찾지 못했어요. 아이폰·아이패드로 다시 시도해 주세요.'
      } else if (/NotReadable|TrackStart/i.test(raw)) {
        message =
          '카메라를 쓸 수 없어요. 다른 앱이 쓰는 중인지 확인해 주세요.'
      }
      setStatus({ kind: 'error', message })
    }
  }, [loop, stop])

  useEffect(() => {
    if (enabled) {
      void start()
    } else {
      stop()
      setStatus({ kind: 'idle' })
    }
    return () => stop()
  }, [enabled, start, stop])

  // Re-bind the same MediaStream when the <video> remounts (panel ↔ PiP).
  useLayoutEffect(() => {
    if (!enabled || status.kind !== 'ready') return
    const video = videoRef.current
    const stream = streamRef.current
    if (!video || !stream) return
    if (video.srcObject !== stream) {
      video.srcObject = stream
      video.muted = true
      video.setAttribute('playsinline', 'true')
      video.setAttribute('webkit-playsinline', 'true')
      void video.play().catch(() => {})
    }
  })

  return {
    videoRef,
    canvasRef,
    status,
    faceLost,
    faceCount,
    streamInfo,
    restart: start,
  }
}
