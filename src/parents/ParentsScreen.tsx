import { XIcon } from '../components/icons'
import { L } from '../components/labels'

export function ParentsScreen({ onBack }: { onBack: () => void }) {
  return (
    <main className="screen parents-screen">
      <button type="button" className="big-button md btn-slate" aria-label={L.backToApp} onClick={onBack}>
        <XIcon />
      </button>
      <div className="parents-content" />
    </main>
  )
}
