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

  it('annuleert een eerdere aanvraag op hetzelfde video-element zonder de nieuwe te storen', async () => {
    const trackA = { stop: vi.fn() }
    const streamA = { getTracks: () => [trackA] } as unknown as MediaStream
    const trackB = { stop: vi.fn() }
    const streamB = { getTracks: () => [trackB] } as unknown as MediaStream
    const getUserMedia = vi.fn().mockResolvedValueOnce(streamA).mockResolvedValueOnce(streamB)
    defineMediaDevices(getUserMedia)
    const video = document.createElement('video')
    Object.defineProperty(video, 'readyState', { value: 2, configurable: true })
    Object.defineProperty(video, 'play', { value: vi.fn().mockResolvedValue(undefined), configurable: true })

    const camera = createBrowserCamera()
    const eerste = camera.open(video)
    const tweede = camera.open(video)

    await expect(eerste).rejects.toThrow('vervangen')
    expect(trackA.stop).toHaveBeenCalled()
    expect(video.srcObject).toBe(streamB)

    const session = await tweede
    session.close()
    expect(trackB.stop).toHaveBeenCalled()
    expect(video.srcObject).toBeNull()
  })

  it('wist de stream van een ander sessie niet bij sluiten', async () => {
    const trackA = { stop: vi.fn() }
    const streamA = { getTracks: () => [trackA] } as unknown as MediaStream
    defineMediaDevices(vi.fn().mockResolvedValue(streamA))
    const video = document.createElement('video')
    Object.defineProperty(video, 'readyState', { value: 2, configurable: true })
    Object.defineProperty(video, 'play', { value: vi.fn().mockResolvedValue(undefined), configurable: true })

    const camera = createBrowserCamera()
    const session = await camera.open(video)
    const andereStream = { getTracks: () => [] } as unknown as MediaStream
    video.srcObject = andereStream
    session.close()
    expect(trackA.stop).toHaveBeenCalled()
    expect(video.srcObject).toBe(andereStream)
  })
})
