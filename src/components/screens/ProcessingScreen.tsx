import { XIcon } from '../icons'
import { L } from '../labels'

export function ProcessingScreen({ onCancel }: { onCancel: () => void }) {
  return (
    <main className="screen processing-screen">
      <button type="button" className="corner-button" aria-label={L.goHome} onClick={onCancel}>
        <XIcon />
      </button>
      <ThinkingOwl />
    </main>
  )
}

function ThinkingOwl() {
  return (
    <div className="owl-wrap" role="img" aria-label={L.thinking}>
      <svg className="owl" viewBox="0 0 200 200" aria-hidden="true" focusable="false">
        <g className="owl-body">
          <ellipse cx="66" cy="46" rx="15" ry="22" fill="#78350f" />
          <ellipse cx="134" cy="46" rx="15" ry="22" fill="#78350f" />
          <ellipse cx="100" cy="118" rx="62" ry="70" fill="#92400e" />
          <ellipse cx="100" cy="134" rx="42" ry="48" fill="#fcd34d" />
          <circle cx="100" cy="82" r="44" fill="#b45309" />
          <g className="owl-eyes">
            <circle cx="82" cy="74" r="16" fill="#fffbeb" />
            <circle cx="118" cy="74" r="16" fill="#fffbeb" />
            <circle cx="82" cy="74" r="7" fill="#1c1917" />
            <circle cx="118" cy="74" r="7" fill="#1c1917" />
          </g>
          <path d="M100 86l-9 13h18z" fill="#f59e0b" />
        </g>
      </svg>
      <div className="think-dots" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
    </div>
  )
}
