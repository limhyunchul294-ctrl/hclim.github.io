import {
  DrawingUtils,
  FaceLandmarker,
  type NormalizedLandmark,
} from '@mediapipe/tasks-vision'

export function drawFaceMesh(
  ctx: CanvasRenderingContext2D,
  landmarks: NormalizedLandmark[],
): void {
  const drawer = new DrawingUtils(ctx)
  drawer.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_TESSELATION, {
    color: 'rgba(61, 155, 143, 0.35)',
    lineWidth: 0.5,
  })
  drawer.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_FACE_OVAL, {
    color: '#3d9b8f',
    lineWidth: 1.5,
  })
  drawer.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_LIPS, {
    color: '#e8a54b',
    lineWidth: 1.5,
  })
  drawer.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_LEFT_EYE, {
    color: '#7eb6ff',
    lineWidth: 1,
  })
  drawer.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_RIGHT_EYE, {
    color: '#7eb6ff',
    lineWidth: 1,
  })
}
