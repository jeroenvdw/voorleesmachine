const MIN_CHARS = 20

export function isValidText(text: string | null | undefined): boolean {
  if (!text) return false
  const trimmed = text.trim()
  if (trimmed.length < MIN_CHARS) return false
  return /[\p{L}]/u.test(trimmed)
}
