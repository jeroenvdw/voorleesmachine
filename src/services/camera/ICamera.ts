import type { CapturedImage } from '../../domain/capturedImage'

export type CameraSession = {
  capture: () => Promise<CapturedImage>
  close: () => void
}

export interface ICamera {
  open: (video: HTMLVideoElement | null) => Promise<CameraSession>
}
