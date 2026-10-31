import { describe, expect, it } from 'vitest'
import { abortableDelay } from './abortableDelay'

describe('abortableDelay', () => {
  it('lost op na de wachttijd', async () => {
    await expect(abortableDelay(10)).resolves.toBeUndefined()
  })

  it('wijst af als het signaal al afgebroken is', async () => {
    const controller = new AbortController()
    controller.abort()
    await expect(abortableDelay(10, controller.signal)).rejects.toMatchObject({ name: 'AbortError' })
  })

  it('wijst af als het signaal tijdens het wachten afgebroken wordt', async () => {
    const controller = new AbortController()
    const promise = abortableDelay(50, controller.signal)
    setTimeout(() => controller.abort(), 10)
    await expect(promise).rejects.toMatchObject({ name: 'AbortError' })
  })
})
