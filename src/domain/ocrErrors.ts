import type { AppErrorCode } from './types'

export type OcrErrorKind = 'no-internet' | 'no-api-key' | 'timeout' | 'failed'

export class OcrError extends Error {
  readonly kind: OcrErrorKind

  constructor(kind: OcrErrorKind, options?: ErrorOptions) {
    super(`OCR-fout: ${kind}`, options)
    this.name = 'OcrError'
    this.kind = kind
  }
}

export function mapOcrErrorToAppError(error: unknown): AppErrorCode {
  if (error instanceof OcrError) {
    switch (error.kind) {
      case 'no-internet':
        return 'no-internet'
      case 'no-api-key':
        return 'no-api-key'
      case 'timeout':
      case 'failed':
        return 'ocr-failed'
    }
  }
  return 'ocr-failed'
}
