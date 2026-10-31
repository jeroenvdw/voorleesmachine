import type { AppErrorCode, AppState, TtsState } from './types'
import type { CapturedImage } from './capturedImage'

export const VOLUME_MIN = 0
export const VOLUME_MAX = 10
export const VOLUME_STEP = 1
export const VOLUME_DEFAULT = 7

export type AppAction =
  | { type: 'open-camera' }
  | { type: 'close-camera' }
  | { type: 'camera-failed' }
  | { type: 'gallery-failed' }
  | { type: 'photo-taken'; image: CapturedImage }
  | { type: 'photo-rejected' }
  | { type: 'photo-confirmed' }
  | { type: 'ocr-succeeded'; text: string }
  | { type: 'ocr-failed'; error: AppErrorCode }
  | { type: 'tts-state-changed'; ttsState: TtsState }
  | { type: 'volume-up' }
  | { type: 'volume-down' }
  | { type: 'next-page' }
  | { type: 'go-home' }
  | { type: 'retry' }

export const initialState: AppState = {
  screen: 'home',
  image: null,
  text: null,
  error: null,
  ttsState: 'idle',
  volume: VOLUME_DEFAULT,
}

function clampVolume(volume: number): number {
  return Math.min(VOLUME_MAX, Math.max(VOLUME_MIN, volume))
}

export type ScreenGuard = (state: AppState) => boolean

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'open-camera':
      return { ...state, screen: 'camera', error: null }
    case 'close-camera':
      return state.screen === 'camera' ? { ...state, screen: 'home' } : state
    case 'camera-failed':
      return state.screen === 'camera'
        ? { ...state, screen: 'error', error: 'camera-unavailable' }
        : state
    case 'gallery-failed':
      return { ...state, screen: 'error', error: 'bad-image', image: null }
    case 'photo-taken':
      return {
        ...state,
        screen: 'review',
        image: action.image,
        text: null,
        error: null,
        ttsState: 'idle',
      }
    case 'photo-rejected':
      return state.screen === 'review' ? { ...state, screen: 'camera' } : state
    case 'photo-confirmed':
      return state.screen === 'review' && state.image
        ? { ...state, screen: 'processing' }
        : state
    case 'ocr-succeeded':
      return state.screen === 'processing'
        ? { ...state, screen: 'reading', text: action.text, ttsState: 'idle' }
        : state
    case 'ocr-failed':
      return state.screen === 'processing' ? { ...state, screen: 'error', error: action.error } : state
    case 'tts-state-changed':
      return state.screen === 'reading' ? { ...state, ttsState: action.ttsState } : state
    case 'volume-up':
      return { ...state, volume: clampVolume(state.volume + VOLUME_STEP) }
    case 'volume-down':
      return { ...state, volume: clampVolume(state.volume - VOLUME_STEP) }
    case 'next-page':
      return { ...state, screen: 'camera', text: null, error: null, ttsState: 'idle' }
    case 'go-home':
      return { ...initialState }
    case 'retry':
      return state.screen === 'error' ? { ...state, screen: 'processing', error: null } : state
  }
}
