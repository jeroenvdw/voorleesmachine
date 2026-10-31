import type { ICamera } from './camera/ICamera'
import type { IOcr } from './ocr/IOcr'
import type { ITts } from './tts/ITts'
import { createMockCamera } from './mock/mockCamera'
import { createMockOcr } from './mock/mockOcr'
import { createMockTts } from './mock/mockTts'

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
    ocr: createMockOcr(),
    tts: createMockTts(),
  }
}

export function createServices(_mock: boolean): Services {
  return createMockServices()
}
