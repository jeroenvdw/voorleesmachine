import { OcrError } from '../../domain/ocrErrors'
import { canvasToBlob } from '../../lib/canvasToBlob'
import type { IOcr } from './IOcr'

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions'
const DEFAULT_TIMEOUT_MS = 60_000
const MAX_IMAGE_DIMENSION = 1600

const NO_TEXT_SENTINEL = 'GEEN_TEKST'

const SYSTEM_PROMPT =
  'Je bent een voorleesmachine voor kinderen. Je bekijkt een foto en haalt daar de voorleestekst van een kinderboekpagina uit. Als er geen leesbare voorleestekst op de foto staat, meld je dat met het ene woord GEEN_TEKST.'

const USER_PROMPT = `Bekijk de foto en geef ALLEEN de voorleestekst terug die letterlijk op de foto staat.
- Verzin niets: gebruik uitsluitend tekst die je echt op de foto ziet.
- Staat er geen leesbare voorleestekst op (bijvoorbeeld een lege pagina, een wazige of donkere foto, of helemaal geen tekst)? Antwoord dan uitsluitend met GEEN_TEKST.
- Houd de oorspronkelijke spelling en interpunctie aan.
- Laat paginanummers, uitgeverstekst, bijschriften bij tekeningen en decortekst weg.
- Volg de leesvolgorde van de pagina, kolom voor kolom van boven naar beneden.
- Zet elke alinea op een eigen regel.
- Geen uitleg, geen markdown, geen aanhalingstekens eromheen.`

export type OpenRouterOcrOptions = {
  getApiKey: () => string
  getModel: () => string
  fetchImpl?: typeof fetch
  timeoutMs?: number
}

type ChatCompletionResponse = {
  choices?: { message?: { content?: unknown } }[]
}

export function createOpenRouterOcr(options: OpenRouterOcrOptions): IOcr {
  const { getApiKey, getModel, fetchImpl = fetch, timeoutMs = DEFAULT_TIMEOUT_MS } = options

  return {
    async recognize(image, signal) {
      const apiKey = getApiKey().trim()
      if (!apiKey) throw new OcrError('no-api-key')
      if (signal?.aborted) throw new DOMException('Afgebroken', 'AbortError')

      const dataUrl = await blobToDataUrl(image)
      const controller = new AbortController()
      const onExternalAbort = () => controller.abort()
      signal?.addEventListener('abort', onExternalAbort, { once: true })
      const timer = setTimeout(() => controller.abort(), timeoutMs)

      let response: Response
      try {
        response = await fetchImpl(OPENROUTER_URL, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: getModel(),
            messages: [
              { role: 'system', content: SYSTEM_PROMPT },
              {
                role: 'user',
                content: [
                  { type: 'text', text: USER_PROMPT },
                  { type: 'image_url', image_url: { url: dataUrl } },
                ],
              },
            ],
            max_tokens: 4000,
            temperature: 0,
          }),
          signal: controller.signal,
        })
      } catch (error) {
        if (signal?.aborted) throw error
        if (controller.signal.aborted) throw new OcrError('timeout')
        throw new OcrError('no-internet', { cause: error })
      } finally {
        clearTimeout(timer)
        signal?.removeEventListener('abort', onExternalAbort)
      }

      try {
        if (!response.ok) {
          if (response.status === 401 || response.status === 403) throw new OcrError('no-api-key')
          const body = await response.text().catch(() => '')
          throw new OcrError('failed', { cause: body })
        }
        const data: unknown = await response.json()
        const content = extractContent(data)
        if (content === null) throw new OcrError('failed')
        if (isNoTextResponse(content)) return ''
        return content
      } catch (error) {
        if (error instanceof OcrError) throw error
        throw new OcrError('failed', { cause: error })
      }
    },
  }
}

function extractContent(data: unknown): string | null {
  if (typeof data !== 'object' || data === null) return null
  const choices = (data as ChatCompletionResponse).choices
  const content = choices?.[0]?.message?.content
  return typeof content === 'string' ? content : null
}

function isNoTextResponse(content: string): boolean {
  const cleaned = content.trim().replace(/^[*_`'" -]+|[*_`'" -]+$/g, '')
  if (!cleaned) return true
  return cleaned === NO_TEXT_SENTINEL || cleaned.startsWith(NO_TEXT_SENTINEL)
}

async function blobToDataUrl(image: Blob): Promise<string> {
  const scaled = await downscaleBlob(image)
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error('Afbeelding niet leesbaar'))
    reader.readAsDataURL(scaled)
  })
}

async function downscaleBlob(image: Blob): Promise<Blob> {
  if (typeof createImageBitmap !== 'function') return image
  let bitmap: ImageBitmap
  try {
    bitmap = await createImageBitmap(image)
  } catch {
    return image
  }
  const scale = Math.min(1, MAX_IMAGE_DIMENSION / Math.max(bitmap.width, bitmap.height))
  if (scale === 1) {
    bitmap.close()
    return image
  }
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    bitmap.close()
    return image
  }
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()
  try {
    return await canvasToBlob(canvas)
  } catch {
    return image
  }
}
