import { createCapturedImage } from '../../domain/capturedImage'
import { canvasToBlob } from '../../lib/canvasToBlob'
import type { CameraSession, ICamera } from './ICamera'

const MAX_DIMENSION = 1600
const VIDEO_READY_TIMEOUT_MS = 5000

export function createBrowserCamera(): ICamera {
  return {
    async open(video) {
      if (!video) throw new Error('Videostream vereist')
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1440 },
        },
        audio: false,
      })
      video.srcObject = stream
      playSafely(video)
      await waitForVideoReady(video)
      const session: CameraSession = {
        async capture() {
          if (!video.videoWidth || !video.videoHeight) throw new Error('Camera geeft nog geen beeld')
          const scale = Math.min(1, MAX_DIMENSION / Math.max(video.videoWidth, video.videoHeight))
          const canvas = document.createElement('canvas')
          canvas.width = Math.round(video.videoWidth * scale)
          canvas.height = Math.round(video.videoHeight * scale)
          const ctx = canvas.getContext('2d')
          if (!ctx) throw new Error('Canvas wordt niet ondersteund')
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
          const blob = await canvasToBlob(canvas)
          return createCapturedImage(blob, canvas.width, canvas.height)
        },
        close() {
          video.srcObject = null
          for (const track of stream.getTracks()) track.stop()
        },
      }
      return session
    },
  }
}

function playSafely(video: HTMLVideoElement): void {
  try {
    video.play().catch(() => undefined)
  } catch {
    return
  }
}

function waitForVideoReady(video: HTMLVideoElement): Promise<void> {
  if (video.readyState >= 2) return Promise.resolve()
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Camera geeft geen beeld')), VIDEO_READY_TIMEOUT_MS)
    video.addEventListener(
      'loadeddata',
      () => {
        clearTimeout(timer)
        resolve()
      },
      { once: true },
    )
  })
}
