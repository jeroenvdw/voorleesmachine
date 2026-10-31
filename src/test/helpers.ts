import type { Services } from '../services'
import type { CapturedImage } from '../domain/capturedImage'
import { createMockOcr, type MockOcrOptions } from '../services/mock/mockOcr'
import { createMockTts } from '../services/mock/mockTts'

export function makeTestImage(id = 'img-test'): CapturedImage {
  return { id, blob: new Blob(['x']), previewUrl: 'blob:test', width: 300, height: 400 }
}

export function makeTestServices(ocrOptions: MockOcrOptions = {}): Services {
  return {
    camera: {
      open: async () => ({
        capture: async () => makeTestImage(),
        close: () => {},
      }),
    },
    ocr: createMockOcr({ delayMs: 10, ...ocrOptions }),
    tts: createMockTts({ speakDurationMs: 300 }),
  }
}
