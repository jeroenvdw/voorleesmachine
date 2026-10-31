import type { TtsState } from '../../domain/types'
import type { ITts, TtsStateListener } from '../tts/ITts'

export type MockTtsOptions = {
  speakDurationMs?: number
  failOnSpeak?: boolean
}

export function createMockTts(options: MockTtsOptions = {}): ITts {
  const speakDurationMs = options.speakDurationMs ?? 5000
  const failOnSpeak = options.failOnSpeak ?? false

  let state: TtsState = 'idle'
  let timer: ReturnType<typeof setTimeout> | null = null
  const listeners = new Set<TtsStateListener>()

  function setState(next: TtsState): void {
    state = next
    for (const listener of listeners) listener(next)
  }

  function clearTimer(): void {
    if (timer !== null) {
      clearTimeout(timer)
      timer = null
    }
  }

  function scheduleFinish(): void {
    clearTimer()
    timer = setTimeout(() => {
      timer = null
      setState('done')
    }, speakDurationMs)
  }

  return {
    speak(_text, _opts) {
      clearTimer()
      if (failOnSpeak) {
        setState('failed')
        return
      }
      setState('speaking')
      scheduleFinish()
    },
    pause() {
      if (state !== 'speaking') return
      clearTimer()
      setState('paused')
    },
    resume() {
      if (state !== 'paused') return
      setState('speaking')
      scheduleFinish()
    },
    stop() {
      clearTimer()
      setState('idle')
    },
    setVolume(_volume) {},
    onStateChange(listener) {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
  }
}
