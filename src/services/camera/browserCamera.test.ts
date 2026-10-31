import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createBrowserCamera } from './browserCamera'

function defineMediaDevices(getUserMedia: unknown): void {
  Object.defineProperty(navigator, 'mediaDevices', {
    value: { getUserMedia },
    configurable: true,
  })
}

describe('createBrowserCamera', () => {
  beforeEach(() => {
    defineMediaDevices(vi.fn())
  })

  it('weigert openen zonder video-element', async () => {
    await expect(createBrowserCamera().open(null)).rejects.toThrow('Videostream vereist')
  })

  it('koppelt de stream aan het video-element en stopt de tracks bij sluiten', async () => {
    const stop = vi.fn()
    const stream = { getTracks: () => [{ stop }] } as unknown as MediaStream
    const getUserMedia = vi.fn().mockResolvedValue(stream)
    defineMediaDevices(getUserMedia)
    const video = document.createElement('video')
    Object.defineProperty(video, 'readyState', { value: 2, configurable: true })
    Object.defineProperty(video, 'play', { value: vi.fn().mockResolvedValue(undefined), configurable: true })
    const session = await createBrowserCamera().open(video)
    expect(getUserMedia).toHaveBeenCalledWith(
      expect.objectContaining({ audio: false, video: expect.objectContaining({ facingMode: 'environment' }) }),
    )
    expect(video.srcObject).toBe(stream)
    session.close()
    expect(stop).toHaveBeenCalled()
    expect(video.srcObject).toBeNull()
  })

  it('geeft een fout als de camera geweigerd wordt', async () => {
    defineMediaDevices(vi.fn().mockRejectedValue(new Error('toestemming geweigerd')))
    const video = document.createElement('video')
    await expect(createBrowserCamera().open(video)).rejects.toThrow('toestemming geweigerd')
  })
})
