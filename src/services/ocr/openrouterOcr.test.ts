import { describe, expect, it, vi } from 'vitest'
import { createOpenRouterOcr } from './openrouterOcr'
import { OcrError } from '../../domain/ocrErrors'

function makeOcr(overrides: Partial<Parameters<typeof createOpenRouterOcr>[0]> = {}) {
  return createOpenRouterOcr({
    getApiKey: () => 'test-key',
    getModel: () => 'test-model',
    timeoutMs: 50,
    ...overrides,
  })
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status })
}

describe('createOpenRouterOcr', () => {
  it('geeft de modelantwoord-tekst terug', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse({ choices: [{ message: { content: 'De kleine draak vloog weg.' } }] }),
    )
    const ocr = makeOcr({ fetchImpl: fetchMock as unknown as typeof fetch })
    const text = await ocr.recognize(new Blob(['foto']))
    expect(text).toBe('De kleine draak vloog weg.')
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toContain('openrouter.ai')
    expect(String(init.headers && (init.headers as Record<string, string>).Authorization)).toContain('test-key')
    const body = JSON.parse(String(init.body))
    expect(body.model).toBe('test-model')
    expect(JSON.stringify(body.messages)).toContain('data:')
  })

  it('gooit geen-sleutel zonder netwerkcall als de key ontbreekt', async () => {
    const fetchMock = vi.fn()
    const ocr = makeOcr({ getApiKey: () => '', fetchImpl: fetchMock as unknown as typeof fetch })
    await expect(ocr.recognize(new Blob(['foto']))).rejects.toMatchObject({ kind: 'no-api-key' })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('behandelt 401 als ontbrekende sleutel', async () => {
    const ocr = makeOcr({ fetchImpl: vi.fn().mockResolvedValue(jsonResponse({}, 401)) as unknown as typeof fetch })
    await expect(ocr.recognize(new Blob(['foto']))).rejects.toMatchObject({ kind: 'no-api-key' })
  })

  it('behandelt andere serverfouten als ocr-faalen', async () => {
    const ocr = makeOcr({ fetchImpl: vi.fn().mockResolvedValue(jsonResponse('oops', 500)) as unknown as typeof fetch })
    await expect(ocr.recognize(new Blob(['foto']))).rejects.toMatchObject({ kind: 'failed' })
  })

  it('behandelt netwerkfouten als geen-internet', async () => {
    const ocr = makeOcr({
      fetchImpl: vi.fn().mockRejectedValue(new TypeError('netwerk weg')) as unknown as typeof fetch,
    })
    await expect(ocr.recognize(new Blob(['foto']))).rejects.toMatchObject({ kind: 'no-internet' })
  })

  it('geeft een timeout bij een hangend verzoek', async () => {
    const fetchMock = vi.fn(
      (_url: string, init: RequestInit) =>
        new Promise((_resolve, reject) => {
          init.signal?.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError')))
        }),
    )
    const ocr = makeOcr({ fetchImpl: fetchMock as unknown as typeof fetch, timeoutMs: 20 })
    await expect(ocr.recognize(new Blob(['foto']))).rejects.toMatchObject({ kind: 'timeout' })
  })

  it('breekt af als het externe signaal al afgebroken is', async () => {
    const fetchMock = vi.fn()
    const ocr = makeOcr({ fetchImpl: fetchMock as unknown as typeof fetch })
    const controller = new AbortController()
    controller.abort()
    await expect(ocr.recognize(new Blob(['foto']), controller.signal)).rejects.toMatchObject({ name: 'AbortError' })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('gooit een fout bij een leeg antwoord', async () => {
    const ocr = makeOcr({
      fetchImpl: vi.fn().mockResolvedValue(jsonResponse({ choices: [] })) as unknown as typeof fetch,
    })
    await expect(ocr.recognize(new Blob(['foto']))).rejects.toMatchObject({ kind: 'failed' })
  })

  it('gooit een OcrError-instantie bij ongeldig json', async () => {
    const ocr = makeOcr({
      fetchImpl: vi.fn().mockResolvedValue(new Response('geen json', { status: 200 })) as unknown as typeof fetch,
    })
    const error = await ocr.recognize(new Blob(['foto'])).catch((e: unknown) => e)
    expect(error).toBeInstanceOf(OcrError)
  })
})
