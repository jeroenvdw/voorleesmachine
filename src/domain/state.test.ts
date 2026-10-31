import { describe, expect, it } from 'vitest'
import { appReducer, initialState, VOLUME_DEFAULT, VOLUME_MAX, VOLUME_MIN } from './state'
import type { CapturedImage } from './capturedImage'

function makeImage(id: string): CapturedImage {
  return { id, blob: new Blob(), previewUrl: `blob:${id}`, width: 100, height: 100 }
}

describe('appReducer', () => {
  it('start op het startscherm', () => {
    expect(initialState.screen).toBe('home')
    expect(initialState.volume).toBe(VOLUME_DEFAULT)
  })

  it('opent de camera vanaf home', () => {
    expect(appReducer(initialState, { type: 'open-camera' }).screen).toBe('camera')
  })

  it('sluit de camera en negeert close-camera buiten de camera', () => {
    const inCamera = appReducer(initialState, { type: 'open-camera' })
    expect(appReducer(inCamera, { type: 'close-camera' }).screen).toBe('home')
    expect(appReducer(initialState, { type: 'close-camera' }).screen).toBe('home')
  })

  it('gaat van foto naar review en wist oude resultaten', () => {
    const state = { ...initialState, screen: 'processing' as const, text: 'oud', error: 'ocr-failed' as const }
    const next = appReducer(state, { type: 'photo-taken', image: makeImage('a') })
    expect(next.screen).toBe('review')
    expect(next.image?.id).toBe('a')
    expect(next.text).toBeNull()
    expect(next.error).toBeNull()
    expect(next.ttsState).toBe('idle')
  })

  it('keert terug naar de camera bij een afgekeurde foto', () => {
    const inReview = appReducer(initialState, { type: 'photo-taken', image: makeImage('a') })
    expect(appReducer(inReview, { type: 'photo-rejected' }).screen).toBe('camera')
  })

  it('bevestigt een foto en gaat naar verwerken', () => {
    const inReview = appReducer(initialState, { type: 'photo-taken', image: makeImage('a') })
    expect(appReducer(inReview, { type: 'photo-confirmed' }).screen).toBe('processing')
  })

  it('gaat van verwerken naar voorlezen met tekst', () => {
    const processing = { ...initialState, screen: 'processing' as const, image: makeImage('a') }
    const next = appReducer(processing, { type: 'ocr-succeeded', text: 'Een lang verhaal.' })
    expect(next.screen).toBe('reading')
    expect(next.text).toBe('Een lang verhaal.')
  })

  it('gaat van verwerken naar fout met foutcode', () => {
    const processing = { ...initialState, screen: 'processing' as const }
    const next = appReducer(processing, { type: 'ocr-failed', error: 'no-internet' })
    expect(next.screen).toBe('error')
    expect(next.error).toBe('no-internet')
  })

  it('verwerkt tts-states alleen op het leesscherm', () => {
    const processing = { ...initialState, screen: 'processing' as const }
    expect(appReducer(processing, { type: 'tts-state-changed', ttsState: 'speaking' }).ttsState).toBe('idle')
    const reading = { ...initialState, screen: 'reading' as const, text: 'verhaal' }
    expect(appReducer(reading, { type: 'tts-state-changed', ttsState: 'speaking' }).ttsState).toBe('speaking')
    expect(appReducer(reading, { type: 'tts-state-changed', ttsState: 'paused' }).ttsState).toBe('paused')
  })

  it('clampt het volume op de grenzen', () => {
    const reading = { ...initialState, screen: 'reading' as const, volume: VOLUME_MAX }
    expect(appReducer(reading, { type: 'volume-up' }).volume).toBe(VOLUME_MAX)
    const atMax = { ...reading, volume: VOLUME_MAX - 1 }
    expect(appReducer(atMax, { type: 'volume-up' }).volume).toBe(VOLUME_MAX)
    const atMin = { ...reading, volume: VOLUME_MIN + 1 }
    expect(appReducer(atMin, { type: 'volume-down' }).volume).toBe(VOLUME_MIN)
    expect(appReducer(reading, { type: 'volume-down' }).volume).toBe(VOLUME_MAX - 1)
  })

  it('start een nieuwe pagina vanaf het leesscherm', () => {
    const reading = {
      ...initialState,
      screen: 'reading' as const,
      image: makeImage('a'),
      text: 'verhaal',
      ttsState: 'done' as const,
      error: 'ocr-failed' as const,
    }
    const next = appReducer(reading, { type: 'next-page' })
    expect(next.screen).toBe('camera')
    expect(next.text).toBeNull()
    expect(next.error).toBeNull()
    expect(next.ttsState).toBe('idle')
  })

  it('probeert het opnieuw vanuit de foutstate', () => {
    const error = { ...initialState, screen: 'error' as const, error: 'ocr-failed' as const }
    const next = appReducer(error, { type: 'retry' })
    expect(next.screen).toBe('processing')
    expect(next.error).toBeNull()
  })

  it('keert naar huis en reset alles', () => {
    const reading = {
      ...initialState,
      screen: 'reading' as const,
      image: makeImage('a'),
      text: 'verhaal',
      ttsState: 'speaking' as const,
      volume: 3,
    }
    const next = appReducer(reading, { type: 'go-home' })
    expect(next).toEqual(initialState)
  })

  it('gaat naar fout bij cameraproblemen', () => {
    const inCamera = appReducer(initialState, { type: 'open-camera' })
    const next = appReducer(inCamera, { type: 'camera-failed' })
    expect(next.screen).toBe('error')
    expect(next.error).toBe('camera-unavailable')
  })

  it('gaat naar fout en wist de foto bij een onleesbare galerij-foto', () => {
    const inReview = appReducer(initialState, { type: 'photo-taken', image: makeImage('a') })
    const next = appReducer(inReview, { type: 'gallery-failed' })
    expect(next.screen).toBe('error')
    expect(next.error).toBe('bad-image')
    expect(next.image).toBeNull()
  })
})
