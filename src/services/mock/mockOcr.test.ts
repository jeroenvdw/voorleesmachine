import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { OcrError } from '../../domain/ocrErrors'
import { createMockOcr } from './mockOcr'

describe('createMockOcr', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('geeft standaard een verhaal terug na korte vertraging', async () => {
    const ocr = createMockOcr({ delayMs: 100 })
    const promise = ocr.recognize(new Blob(['foto']))
    vi.advanceTimersByTime(100)
    await expect(promise).resolves.toContain('draak')
  })

  it('kan een eigen tekst teruggeven', async () => {
    const ocr = createMockOcr({ delayMs: 0, text: 'Eigen tekst.' })
    const promise = ocr.recognize(new Blob())
    vi.advanceTimersByTime(0)
    await expect(promise).resolves.toBe('Eigen tekst.')
  })

  it('geeft witruimte terug bij geen-tekst-gevonden', async () => {
    const ocr = createMockOcr({ delayMs: 0, errorKind: 'no-text-found' })
    const promise = ocr.recognize(new Blob())
    vi.advanceTimersByTime(0)
    await expect(promise).resolves.toBe('   ')
  })

  it('gooit een OcrError bij een foutvariant', async () => {
    const ocr = createMockOcr({ delayMs: 0, errorKind: 'failed' })
    const promise = ocr.recognize(new Blob())
    vi.advanceTimersByTime(0)
    await expect(promise).rejects.toMatchObject({ name: 'OcrError', kind: 'failed' })
  })

  it('breekt af wanneer het signaal afgebroken wordt', async () => {
    const ocr = createMockOcr({ delayMs: 1000 })
    const controller = new AbortController()
    const promise = ocr.recognize(new Blob(), controller.signal)
    vi.advanceTimersByTime(10)
    controller.abort()
    await expect(promise).rejects.toMatchObject({ name: 'AbortError' })
  })

  it('gooit een echte OcrError-instantie', () => {
    expect(new OcrError('failed')).toBeInstanceOf(OcrError)
  })
})
