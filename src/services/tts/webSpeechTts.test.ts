import { describe, expect, it, vi } from 'vitest'
import {
  createWebSpeechTts,
  defaultChunker,
  type SynthesisLike,
  type UtteranceLike,
} from './webSpeechTts'

type FakeUtterance = UtteranceLike & {
  spokenText: string
}

function createFakeSynthesis() {
  const spoken: FakeUtterance[] = []
  const synth: SynthesisLike = {
    speak: (utterance) => {
      spoken.push(utterance as FakeUtterance)
    },
    cancel: vi.fn(),
    pause: vi.fn(),
    resume: vi.fn(),
    getVoices: () => [],
  }
  const factory = (text: string): FakeUtterance => {
    const utterance: FakeUtterance = {
      spokenText: text,
      text,
      lang: '',
      rate: 0,
      volume: 0,
      voice: null,
      onstart: null,
      onend: null,
      onerror: null,
    }
    return utterance
  }
  return { synth, spoken, factory }
}

describe('defaultChunker', () => {
  it('splitst op alinea’s', () => {
    expect(defaultChunker('Eén.\n\nTwee.\n\nDrie.')).toEqual(['Eén.', 'Twee.', 'Drie.'])
  })

  it('splitst lange alinea’s op zinsgrenzen', () => {
    const long = 'Zin een is hier. '.repeat(20)
    const parts = defaultChunker(long)
    expect(parts.length).toBeGreaterThan(1)
    for (const part of parts) {
      expect(part.length).toBeLessThanOrEqual(220)
    }
    expect(parts.join(' ').replace(/\s+/g, ' ').trim()).toBe(long.replace(/\s+/g, ' ').trim())
  })

  it('geeft een lege lijst bij alleen witruimte', () => {
    expect(defaultChunker('   \n  ')).toEqual([])
  })
})

describe('createWebSpeechTts', () => {
  it('spreekt alinea’s achter elkaar en eindigt met done', () => {
    const { synth, spoken, factory } = createFakeSynthesis()
    const tts = createWebSpeechTts({ synthesis: synth, utteranceFactory: factory })
    const states: string[] = []
    tts.onStateChange((s) => states.push(s))

    tts.speak('Eerste alinea.\n\nTweede alinea.', { volume: 0.8 })
    expect(states).toEqual(['speaking'])
    expect(spoken.length).toBe(1)
    expect(spoken[0].lang).toBe('nl-NL')
    expect(spoken[0].volume).toBe(0.8)

    emit(spoken[0], 'onend')
    expect(spoken.length).toBe(2)
    emit(spoken[1], 'onend')
    expect(states).toEqual(['speaking', 'done'])
  })

  it('pauzeert en hervat', () => {
    const { synth, spoken, factory } = createFakeSynthesis()
    const tts = createWebSpeechTts({ synthesis: synth, utteranceFactory: factory })
    const states: string[] = []
    tts.onStateChange((s) => states.push(s))
    tts.speak('Verhaal.', { volume: 1 })

    tts.pause()
    expect(states).toEqual(['speaking', 'paused'])
    expect(synth.pause).toHaveBeenCalled()
    emit(spoken[0], 'onend')
    expect(states).toEqual(['speaking', 'paused'])

    tts.resume()
    expect(states).toEqual(['speaking', 'paused', 'speaking'])
    expect(synth.resume).toHaveBeenCalled()
    emit(spoken[0], 'onend')
    expect(states.at(-1)).toBe('done')
  })

  it('stopt en negeert late eind-events', () => {
    const { synth, spoken, factory } = createFakeSynthesis()
    const tts = createWebSpeechTts({ synthesis: synth, utteranceFactory: factory })
    const states: string[] = []
    tts.onStateChange((s) => states.push(s))
    tts.speak('Verhaal.', { volume: 1 })
    tts.stop()
    expect(states).toEqual(['speaking', 'idle'])
    expect(synth.cancel).toHaveBeenCalled()
    emit(spoken[0], 'onend')
    expect(states).toEqual(['speaking', 'idle'])
  })

  it('herstart het huidige stuk bij volumeaanpassing', () => {
    const { synth, spoken, factory } = createFakeSynthesis()
    const tts = createWebSpeechTts({ synthesis: synth, utteranceFactory: factory })
    tts.speak('Eerste stuk.\n\nTweede stuk.', { volume: 1 })
    tts.setVolume(0.4)
    expect(spoken.length).toBe(2)
    expect(spoken[1].volume).toBe(0.4)
    expect(spoken[1].spokenText).toBe('Eerste stuk.')
    emit(spoken[0], 'onend')
    expect(spoken.length).toBe(2)
    emit(spoken[1], 'onend')
    expect(spoken.length).toBe(3)
    expect(spoken[2].spokenText).toBe('Tweede stuk.')
    emit(spoken[2], 'onend')
    expect(spoken.length).toBe(3)
  })

  it('kiest een Nederlandse stem', () => {
    const fake = createFakeSynthesis()
    const nlVoice = { lang: 'nl-NL', name: 'Google Nederlands' }
    const enVoice = { lang: 'en-US', name: 'English' }
    const synth: SynthesisLike = { ...fake.synth, getVoices: () => [enVoice, nlVoice] }
    const tts = createWebSpeechTts({ synthesis: synth, utteranceFactory: fake.factory })
    tts.speak('Hoi.', { volume: 1 })
    expect(fake.spoken[0].voice).toBe(nlVoice)
  })

  it('markeert lege tekst meteen als done', () => {
    const fake = createFakeSynthesis()
    const tts = createWebSpeechTts({ synthesis: fake.synth, utteranceFactory: fake.factory })
    const states: string[] = []
    tts.onStateChange((s) => states.push(s))
    tts.speak('   ', { volume: 1 })
    expect(states).toEqual(['done'])
  })
})

function emit(utterance: UtteranceLike, handler: 'onend' | 'onerror'): void {
  const callback = utterance[handler]
  if (typeof callback === 'function') callback()
}
