import {
  FaceLandmarker,
  FilesetResolver,
  type FaceLandmarkerResult,
} from '@mediapipe/tasks-vision'

const MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task'

const WASM_CDN =
  'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.1.1/wasm'

async function resolveWasm() {
  return FilesetResolver.forVisionTasks(WASM_CDN)
}

export async function createFaceLandmarker(): Promise<FaceLandmarker> {
  const vision = await resolveWasm()
  const common = {
    runningMode: 'VIDEO' as const,
    numFaces: 1,
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

function blendScore(result: FaceLandmarkerResult, name: string): number {
  const cats = result.faceBlendshapes?.[0]?.categories
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

export function extractFaceSignals(
  result: FaceLandmarkerResult,
  timestampMs: number,
) {
  const landmarks = result.faceLandmarks?.[0]
  const hasFace = Boolean(landmarks && landmarks.length > 0)

  if (!hasFace || !landmarks) {
    return {
      timestampMs,
      hasFace: false,
      jawOpen: 0,
      mouthSmile: 0,
      eyeBlinkLeft: 0,
      eyeBlinkRight: 0,
      mar: 0,
      landmarks: [] as Array<{ x: number; y: number; z: number }>,
    }
  }

  const jawOpen = blendScore(result, 'jawOpen')
  const smileL = blendScore(result, 'mouthSmileLeft')
  const smileR = blendScore(result, 'mouthSmileRight')
  const eyeBlinkLeft = blendScore(result, 'eyeBlinkLeft')
  const eyeBlinkRight = blendScore(result, 'eyeBlinkRight')

  return {
    timestampMs,
    hasFace: true,
    jawOpen,
    mouthSmile: Math.max(smileL, smileR),
    eyeBlinkLeft,
    eyeBlinkRight,
    mar: computeMar(landmarks),
    landmarks: landmarks.map((p) => ({ x: p.x, y: p.y, z: p.z ?? 0 })),
  }
}

export { FaceLandmarker }
