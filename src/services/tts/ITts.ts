import type { TtsState } from '../../domain/types'

export type SpeakOptions = {
  volume: number
}

export type TtsStateListener = (state: TtsState) => void

export interface ITts {
  speak: (text: string, options: SpeakOptions) => void
  pause: () => void
  resume: () => void
  stop: () => void
  setVolume: (volume: number) => void
  onStateChange: (listener: TtsStateListener) => () => void
}
