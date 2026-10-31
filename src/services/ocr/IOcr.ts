export interface IOcr {
  recognize: (image: Blob, signal?: AbortSignal) => Promise<string>
}
