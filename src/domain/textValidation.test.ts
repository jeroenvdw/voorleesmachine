import { describe, expect, it } from 'vitest'
import { isValidText } from './textValidation'

describe('isValidText', () => {
  it('verwerpt lege of korte tekst', () => {
    expect(isValidText(null)).toBe(false)
    expect(isValidText(undefined)).toBe(false)
    expect(isValidText('')).toBe(false)
    expect(isValidText('   ')).toBe(false)
    expect(isValidText('Hallo')).toBe(false)
  })

  it('verwerpt tekst zonder letters', () => {
    expect(isValidText('12345678901234567890')).toBe(false)
    expect(isValidText('12 34 56 78 90 12')).toBe(false)
  })

  it('accepteert gewone leestekst', () => {
    expect(isValidText('De kleine draak vloog hoog boven de bergen.')).toBe(true)
    expect(isValidText('  Coöperatieve ééntenige vogeltjes fluiten heerlijk.  ')).toBe(true)
  })
})
