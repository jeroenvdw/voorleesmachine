import { createCapturedImage } from '../domain/capturedImage'
import type { CapturedImage } from '../domain/capturedImage'

export async function createCapturedImageFromFile(file: Blob): Promise<CapturedImage> {
  const dimensions = await readImageDimensions(file)
  return createCapturedImage(file, dimensions.width, dimensions.height)
}

async function readImageDimensions(file: Blob): Promise<{ width: number; height: number }> {
  if (typeof createImageBitmap === 'function') {
    try {
      const bitmap = await createImageBitmap(file)
      const dimensions = { width: bitmap.width, height: bitmap.height }
      bitmap.close()
      return dimensions
    } catch {
      throw new Error('Afbeelding niet leesbaar')
    }
  }
  return readViaImageElement(file)
}

function readViaImageElement(file: Blob): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const image = new Image()
    image.onload = () => {
      URL.revokeObjectURL(url)
      resolve({ width: image.naturalWidth, height: image.naturalHeight })
    }
    image.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Afbeelding niet leesbaar'))
    }
    image.src = url
  })
}
