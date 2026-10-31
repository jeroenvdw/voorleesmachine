import { OcrError, type OcrErrorKind } from '../../domain/ocrErrors'
import { abortableDelay } from '../../lib/abortableDelay'
import type { IOcr } from '../ocr/IOcr'

export const MOCK_STORY_TEXT = `De kleine draak Bram woonde in een hol boven de Berg van Sterren.
Elke avond voor hij ging slapen, telde hij de sterren aan de hemel.
Op een avond telde hij maar liefst negenhonderd vijfendertig sterren.
Toen zag hij opeens dat er eentje aan het wiebelen was.
"Hallo?" riep Bram. "Ben jij een ster, of ben jij een brandende steen?"
De ster glimlachte en zei: "Ik ben Felicity, en ik ben van je zaklicht gedwaald."
Bram pakte zijn zaklamp en blies er heel voorzichtig sterrenstof op.
Zo kon Felicity weer de weg terug naar de hemel vinden.
"Bedankt, lieve draak!" riep Felicity, en ze danste tussen de wolken.
En Bram, heel blij vanbinnen, sliep die nacht als een droom.`

export type MockOcrOptions = {
  text?: string
  delayMs?: number
  errorKind?: OcrErrorKind | 'no-text-found'
}

export function createMockOcr(options: MockOcrOptions = {}): IOcr {
  const { text = MOCK_STORY_TEXT, delayMs = 1200, errorKind } = options

  return {
    async recognize(_image, signal) {
      await abortableDelay(delayMs, signal)
      if (errorKind === 'no-text-found') return '   '
      if (errorKind) throw new OcrError(errorKind)
      return text
    },
  }
}
