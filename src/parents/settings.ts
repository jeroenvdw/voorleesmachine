export type ParentsSettings = {
  apiKey: string
  model: string
}

export const DEFAULT_OCR_MODEL = 'google/gemini-2.5-flash'

const STORAGE_KEY = 'voorleesmachine:settings'

export function createMemoryStorage(): Storage {
  const map = new Map<string, string>()
  return {
    get length() {
      return map.size
    },
    clear: () => map.clear(),
    getItem: (key) => map.get(key) ?? null,
    key: (index) => Array.from(map.keys())[index] ?? null,
    removeItem: (key) => {
      map.delete(key)
    },
    setItem: (key, value) => {
      map.set(key, String(value))
    },
  }
}

function defaultStorage(): Storage {
  try {
    if (typeof window !== 'undefined' && window.localStorage) return window.localStorage
  } catch {
    return createMemoryStorage()
  }
  return createMemoryStorage()
}

const emptySettings = (): ParentsSettings => ({ apiKey: '', model: DEFAULT_OCR_MODEL })

export function loadSettings(storage: Storage = defaultStorage()): ParentsSettings {
  try {
    const raw = storage.getItem(STORAGE_KEY)
    if (!raw) return emptySettings()
    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null) return emptySettings()
    const record = parsed as Record<string, unknown>
    return {
      apiKey: typeof record.apiKey === 'string' ? record.apiKey : '',
      model: typeof record.model === 'string' && record.model ? record.model : DEFAULT_OCR_MODEL,
    }
  } catch {
    return emptySettings()
  }
}

export function saveSettings(settings: ParentsSettings, storage: Storage = defaultStorage()): void {
  storage.setItem(
    STORAGE_KEY,
    JSON.stringify({ apiKey: settings.apiKey.trim(), model: settings.model.trim() || DEFAULT_OCR_MODEL }),
  )
}

export function hasApiKey(storage: Storage = defaultStorage()): boolean {
  return loadSettings(storage).apiKey.trim().length > 0
}
