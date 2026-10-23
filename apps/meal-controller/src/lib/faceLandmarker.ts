import {
  FaceLandmarker,
  FilesetResolver,
  type FaceLandmarkerResult,
} from '@mediapipe/tasks-vision'
import type { FaceFrame, FaceSignals } from './types'

const MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task'

const WASM_CDN =
  'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.1.1/wasm'

async function resolveWasm() {
  return FilesetResolver.forVisionTasks(WASM_CDN)
}

/** Always allow up to 2 faces; app enforces 1명 / 2명 rules. */
export async function createFaceLandmarker(): Promise<FaceLandmarker> {
  const vision = await resolveWasm()
  const common = {
    runningMode: 'VIDEO' as const,
    numFaces: 2,
    outputFaceBlendshapes: true,
    outputFacialTransformationMatrixes: false,
  }
  try {
    return await FaceLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: MODEL_URL,
        delegate: 'GPU',
      },
      ...common,
    })
  } catch {
    return FaceLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: MODEL_URL,
        delegate: 'CPU',
      },
      ...common,
    })
  }
}

function blendScore(
  result: FaceLandmarkerResult,
  name: string,
  faceIndex: number,
): number {
  const cats = result.faceBlendshapes?.[faceIndex]?.categories
  if (!cats?.length) return 0
  const want = name.toLowerCase().replace(/[_\s]/g, '')
  const hit = cats.find((c) => {
    const a = (c.categoryName ?? '').toLowerCase().replace(/[_\s]/g, '')
    const b = (c.displayName ?? '').toLowerCase().replace(/[_\s]/g, '')
    return a === want || b === want
  })
  return hit?.score ?? 0
}

/** Mouth Aspect Ratio from lip landmarks (13/14 vertical, 78/308 horizontal). */
export function computeMar(
  landmarks: Array<{ x: number; y: number }>,
): number {
  if (landmarks.length < 309) return 0
  const top = landmarks[13]
  const bottom = landmarks[14]
  const left = landmarks[78]
  const right = landmarks[308]
  const vertical = Math.hypot(top.x - bottom.x, top.y - bottom.y)
  const horizontal = Math.hypot(left.x - right.x, left.y - right.y)
  if (horizontal < 1e-6) return 0
  return vertical / horizontal
}

function signalsForFace(
  result: FaceLandmarkerResult,
  faceIndex: number,
): FaceSignals | null {
  const landmarks = result.faceLandmarks?.[faceIndex]
  if (!landmarks?.length) return null
  const smileL = blendScore(result, 'mouthSmileLeft', faceIndex)
  const smileR = blendScore(result, 'mouthSmileRight', faceIndex)
  return {
    jawOpen: blendScore(result, 'jawOpen', faceIndex),
    mouthSmile: Math.max(smileL, smileR),
    eyeBlinkLeft: blendScore(result, 'eyeBlinkLeft', faceIndex),
    eyeBlinkRight: blendScore(result, 'eyeBlinkRight', faceIndex),
    mar: computeMar(landmarks),
    landmarks: landmarks.map((p) => ({ x: p.x, y: p.y, z: p.z ?? 0 })),
  }
}

export function extractFaceSignals(
  result: FaceLandmarkerResult,
  timestampMs: number,
): FaceFrame {
  const count = result.faceLandmarks?.length ?? 0
  const faces: FaceSignals[] = []
  for (let i = 0; i < count; i++) {
    const s = signalsForFace(result, i)
    if (s) faces.push(s)
  }
  const primary = faces[0]
  if (!primary) {
    return {
      timestampMs,
      hasFace: false,
      faceCount: 0,
      faces: [],
      jawOpen: 0,
      mouthSmile: 0,
      eyeBlinkLeft: 0,
      eyeBlinkRight: 0,
      mar: 0,
      landmarks: [],
    }
  }
  return {
    timestampMs,
    hasFace: true,
    faceCount: faces.length,
    faces,
    jawOpen: primary.jawOpen,
    mouthSmile: primary.mouthSmile,
    eyeBlinkLeft: primary.eyeBlinkLeft,
    eyeBlinkRight: primary.eyeBlinkRight,
    mar: primary.mar,
    landmarks: primary.landmarks,
  }
}

export { FaceLandmarker }
