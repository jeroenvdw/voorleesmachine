export type CapturedImage = {
  id: string
  blob: Blob
  previewUrl: string
  width: number
  height: number
}

let counter = 0

export function createCapturedImage(blob: Blob, width: number, height: number): CapturedImage {
  counter += 1
  return {
    id: `img-${counter}`,
    blob,
    previewUrl: URL.createObjectURL(blob),
    width,
    height,
  }
}

export function disposeCapturedImage(image: CapturedImage | null): void {
  if (image) URL.revokeObjectURL(image.previewUrl)
}
