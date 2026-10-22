import { useCallback, useEffect, useRef, useState } from 'react'
import type { FaceLandmarker } from '@mediapipe/tasks-vision'
import {
  createFaceLandmarker,
  extractFaceSignals,
} from '../lib/faceLandmarker'
import { drawFaceMesh } from '../lib/drawMesh'
import type { FaceFrame } from '../lib/types'

type Options = {
  showMesh: boolean
  onFrame: (frame: FaceFrame) => void
  enabled: boolean
}

type Status =
  | { kind: 'idle' }
  | { kind: 'loading'; message: string }
  | { kind: 'ready' }
  | { kind: 'error'; message: string }

export function useCameraLandmarker({
  showMesh,
  onFrame,
  enabled,
}: Options) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const landmarkerRef = useRef<FaceLandmarker | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const rafRef = useRef<number>(0)
  const lastTsRef = useRef<number>(-1)
  const onFrameRef = useRef(onFrame)
  const showMeshRef = useRef(showMesh)

  const [status, setStatus] = useState<Status>({ kind: 'idle' })
  const [faceLost, setFaceLost] = useState(false)

  useEffect(() => {
    onFrameRef.current = onFrame
  }, [onFrame])

  useEffect(() => {
    showMeshRef.current = showMesh
  }, [showMesh])

  const stop = useCallback(() => {
    cancelAnimationFrame(rafRef.current)
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    landmarkerRef.current?.close()
    landmarkerRef.current = null
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }, [])

  const loop = useCallback(() => {
    const video = videoRef.current
    const canvas = canvasRef.current
    const landmarker = landmarkerRef.current
    if (!video || !canvas || !landmarker) return

    if (video.readyState >= 2) {
      const now = performance.now()
      if (now - lastTsRef.current > 40) {
        // ~25 FPS max; chewing band is ~0.6–2.5 Hz
        lastTsRef.current = now
        try {
          const result = landmarker.detectForVideo(video, now)
          const frame = extractFaceSignals(result, now)
          setFaceLost(!frame.hasFace)
          onFrameRef.current(frame)

          const ctx = canvas.getContext('2d')
          if (ctx) {
            if (canvas.width !== video.videoWidth) {
              canvas.width = video.videoWidth || 640
              canvas.height = video.videoHeight || 480
            }
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            if (
              showMeshRef.current &&
              frame.hasFace &&
              result.faceLandmarks?.[0]
            ) {
              drawFaceMesh(ctx, result.faceLandmarks[0])
            }
          }
        } catch (err) {
          console.warn('detectForVideo failed', err)
        }
      }
    }
    rafRef.current = requestAnimationFrame(loop)
  }, [])

  const start = useCallback(async () => {
    stop()
    setStatus({ kind: 'loading', message: '모델·카메라 준비 중…' })
    try {
      const landmarker = await createFaceLandmarker()
      landmarkerRef.current = landmarker

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
      })
      streamRef.current = stream

      const video = videoRef.current
      if (!video) throw new Error('video element missing')
      video.srcObject = stream
      await video.play()

      setStatus({ kind: 'ready' })
      rafRef.current = requestAnimationFrame(loop)
    } catch (err) {
      stop()
      const message =
        err instanceof Error
          ? err.message
          : '카메라 또는 모델 로드에 실패했습니다.'
      setStatus({
        kind: 'error',
        message:
          message.includes('Permission') || message.includes('NotAllowed')
            ? '카메라 권한이 거부되었습니다. 브라우저 설정에서 허용해 주세요.'
            : message,
      })
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

  return { videoRef, canvasRef, status, faceLost, restart: start }
}
