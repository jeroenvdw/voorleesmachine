import type { CapturedImage } from './capturedImage'

export type TtsState = 'idle' | 'speaking' | 'paused' | 'done' | 'failed'

export type AppErrorCode =
  | 'no-text-found'
  | 'camera-unavailable'
  | 'no-internet'
  | 'no-api-key'
  | 'ocr-failed'
  | 'bad-image'

export type Screen = 'home' | 'camera' | 'review' | 'processing' | 'reading' | 'error'

export type AppState = {
  screen: Screen
  image: CapturedImage | null
  text: string | null
  error: AppErrorCode | null
  ttsState: TtsState
  volume: number
}
