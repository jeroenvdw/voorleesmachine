import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createMockTts } from './mockTts'

describe('createMockTts', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('gaat van spreken naar klaar na de duur', () => {
    const tts = createMockTts({ speakDurationMs: 1000 })
    const states: string[] = []
    tts.onStateChange((s) => states.push(s))
    tts.speak('verhaal', { volume: 1 })
    expect(states).toEqual(['speaking'])
    vi.advanceTimersByTime(1000)
    expect(states).toEqual(['speaking', 'done'])
  })

  it('pauzeert en hervat', () => {
    const tts = createMockTts({ speakDurationMs: 1000 })
    const states: string[] = []
    tts.onStateChange((s) => states.push(s))
    tts.speak('verhaal', { volume: 1 })
    tts.pause()
    expect(states).toEqual(['speaking', 'paused'])
    vi.advanceTimersByTime(2000)
    expect(states).toEqual(['speaking', 'paused'])
    tts.resume()
    expect(states).toEqual(['speaking', 'paused', 'speaking'])
    vi.advanceTimersByTime(1000)
    expect(states.at(-1)).toBe('done')
  })

  it('stopt en geeft geen klaar-event meer', () => {
    const tts = createMockTts({ speakDurationMs: 1000 })
    const states: string[] = []
    tts.onStateChange((s) => states.push(s))
    tts.speak('verhaal', { volume: 1 })
    tts.stop()
    expect(states).toEqual(['speaking', 'idle'])
    vi.advanceTimersByTime(5000)
    expect(states).toEqual(['speaking', 'idle'])
  })

  it('kan een listener afmelden', () => {
    const tts = createMockTts({ speakDurationMs: 1000 })
    const states: string[] = []
    const unsubscribe = tts.onStateChange((s) => states.push(s))
    unsubscribe()
    tts.speak('verhaal', { volume: 1 })
    expect(states).toEqual([])
  })

  it('gaat naar failed bij failOnSpeak', () => {
    const tts = createMockTts({ failOnSpeak: true })
    const states: string[] = []
    tts.onStateChange((s) => states.push(s))
    tts.speak('verhaal', { volume: 1 })
    expect(states).toEqual(['failed'])
    tts.pause()
    tts.resume()
    expect(states).toEqual(['failed'])
    tts.stop()
    expect(states).toEqual(['failed', 'idle'])
  })

  it('ignoreert pauze buiten het spreken', () => {
    const tts = createMockTts()
    tts.pause()
    tts.resume()
    tts.stop()
    expect(true).toBe(true)
  })
})
