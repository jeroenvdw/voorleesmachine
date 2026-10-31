import { useEffect, useRef, useState } from 'react'
import { DEFAULT_OCR_MODEL, loadSettings, saveSettings } from './settings'
import { CheckIcon, KeySlashIcon, XIcon } from '../components/icons'
import { L } from '../components/labels'

export function ParentsScreen({ onBack }: { onBack: () => void }) {
  const [apiKey, setApiKey] = useState('')
  const [model, setModel] = useState(DEFAULT_OCR_MODEL)
  const [keyStored, setKeyStored] = useState(false)
  const [saved, setSaved] = useState(false)
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    const settings = loadSettings()
    setApiKey(settings.apiKey)
    setModel(settings.model)
    setKeyStored(settings.apiKey.trim().length > 0)
  }, [])

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) clearTimeout(timerRef.current)
    }
  }, [])

  const save = () => {
    saveSettings({ apiKey, model })
    setKeyStored(apiKey.trim().length > 0)
    setSaved(true)
    if (timerRef.current !== null) clearTimeout(timerRef.current)
    timerRef.current = window.setTimeout(() => setSaved(false), 2000)
  }

  return (
    <main className="screen parents-screen">
      <button type="button" className="big-button md btn-slate" aria-label={L.backToApp} onClick={onBack}>
        <XIcon />
      </button>
      <div className="parents-content">
        <div
          className={`parents-status ${keyStored ? 'ok' : ''}`}
          role="img"
          aria-label={keyStored ? L.keyStored : L.keyMissing}
        >
          {keyStored ? <CheckIcon /> : <KeySlashIcon />}
        </div>
        <label className="parents-field">
          <span>Geheime sleutel (OpenRouter)</span>
          <input
            type="password"
            value={apiKey}
            autoComplete="off"
            spellCheck={false}
            onChange={(event) => setApiKey(event.target.value)}
          />
        </label>
        <label className="parents-field">
          <span>AI-model</span>
          <input
            type="text"
            value={model}
            autoComplete="off"
            spellCheck={false}
            onChange={(event) => setModel(event.target.value)}
          />
        </label>
        <button
          type="button"
          className={`big-button md ${saved ? 'btn-green' : 'btn-orange'}`}
          aria-label={L.saveSettings}
          onClick={save}
        >
          <CheckIcon />
        </button>
        <p className="parents-note">De sleutel wordt alleen op dit toestel bewaard en nooit verstuurd, behalve naar OpenRouter bij het voorlezen van een pagina.</p>
      </div>
    </main>
  )
}
