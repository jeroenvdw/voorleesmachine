import { createCapturedImage } from '../../domain/capturedImage'
import type { ICamera, CameraSession } from '../camera/ICamera'

export type MockCameraOptions = {
  captureDelayMs?: number
}

export function createMockCamera(options: MockCameraOptions = {}): ICamera {
  const captureDelayMs = options.captureDelayMs ?? 400

  return {
    async open(_video) {
      const session: CameraSession = {
        async capture() {
          const canvas = document.createElement('canvas')
          canvas.width = 1200
          canvas.height = 900
          const ctx = canvas.getContext('2d')
          if (!ctx) throw new Error('Canvas wordt niet ondersteund')
          drawFakeBookPage(ctx, canvas.width, canvas.height)
          const blob = await canvasToBlob(canvas)
          return createCapturedImage(blob, canvas.width, canvas.height)
        },
        close() {},
      }
      await delay(captureDelayMs)
      return session
    },
  }
}

function drawFakeBookPage(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  ctx.fillStyle = '#fdf6e3'
  ctx.fillRect(0, 0, width, height)
  ctx.fillStyle = '#2563eb'
  ctx.fillRect(width * 0.25, height * 0.08, width * 0.5, height * 0.09)
  ctx.fillStyle = '#cbd5e1'
  for (let i = 0; i < 12; i += 1) {
    const lineY = height * 0.26 + i * height * 0.055
    const lineWidth = i % 5 === 4 ? width * 0.42 : width * 0.62
    ctx.fillRect(width * 0.15, lineY, lineWidth, height * 0.02)
  }
  ctx.fillStyle = '#f59e0b'
  ctx.beginPath()
  ctx.arc(width * 0.78, height * 0.82, height * 0.09, 0, Math.PI * 2)
  ctx.fill()
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob)
      else reject(new Error('Canvas naar Blob mislukt'))
    }, 'image/jpeg', 0.9)
  })
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
