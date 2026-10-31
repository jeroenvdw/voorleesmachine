import type { ICamera } from './camera/ICamera'
import type { IOcr } from './ocr/IOcr'
import type { ITts } from './tts/ITts'
import { createBrowserCamera } from './camera/browserCamera'
import { createOpenRouterOcr } from './ocr/openrouterOcr'
import { createWebSpeechTts, isWebSpeechAvailable } from './tts/webSpeechTts'
import { createMockCamera } from './mock/mockCamera'
import { createMockOcr, type MockOcrOptions } from './mock/mockOcr'
import { createMockTts } from './mock/mockTts'
import { loadSettings } from '../parents/settings'

export type Services = {
  camera: ICamera
  ocr: IOcr
  tts: ITts
}

export function isMockMode(): boolean {
  if (typeof window === 'undefined') return true
  return new URLSearchParams(window.location.search).has('mock')
}

export function createMockServices(): Services {
  return {
    camera: createMockCamera(),
    ocr: createMockOcr(mockOcrOptionsFromUrl()),
    tts: createMockTts(),
  }
}

function mockOcrOptionsFromUrl(): MockOcrOptions {
  if (typeof window === 'undefined') return {}
  const params = new URLSearchParams(window.location.search)
  if (params.get('ocr') === 'empty') return { errorKind: 'no-text-found' }
  if (params.get('ocr') === 'fail') return { errorKind: 'failed' }
  return {}
}

export function createServices(mock: boolean): Services {
  const mockServices = createMockServices()
  if (mock) return mockServices
  return {
    camera: createBrowserCamera(),
    ocr: createOpenRouterOcr({
      getApiKey: () => loadSettings().apiKey,
      getModel: () => loadSettings().model,
    }),
    tts: isWebSpeechAvailable() ? createWebSpeechTts() : mockServices.tts,
  }
}
