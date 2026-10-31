import { describe, expect, it } from 'vitest'
import { mapOcrErrorToAppError, OcrError } from './ocrErrors'

describe('mapOcrErrorToAppError', () => {
  it('zet OcrError-varianten om naar app-foutcodes', () => {
    expect(mapOcrErrorToAppError(new OcrError('no-internet'))).toBe('no-internet')
    expect(mapOcrErrorToAppError(new OcrError('no-api-key'))).toBe('no-api-key')
    expect(mapOcrErrorToAppError(new OcrError('timeout'))).toBe('ocr-failed')
    expect(mapOcrErrorToAppError(new OcrError('failed'))).toBe('ocr-failed')
  })

  it('zet onbekende fouten om naar ocr-failed', () => {
    expect(mapOcrErrorToAppError(new Error('onverwacht'))).toBe('ocr-failed')
    expect(mapOcrErrorToAppError('garnaal')).toBe('ocr-failed')
  })
})
