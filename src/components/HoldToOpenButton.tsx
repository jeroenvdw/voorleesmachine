import { useRef, type ReactNode } from 'react'

export function HoldToOpenButton({
  label,
  icon,
  holdMs = 2000,
  onOpen,
}: {
  label: string
  icon: ReactNode
  holdMs?: number
  onOpen: () => void
}) {
  const timerRef = useRef<number | null>(null)

  const start = () => {
    if (timerRef.current !== null) return
    timerRef.current = window.setTimeout(() => {
      timerRef.current = null
      onOpen()
    }, holdMs)
  }

  const cancel = () => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }

  return (
    <button
      type="button"
      className="corner-gear"
      aria-label={label}
      onPointerDown={start}
      onPointerUp={cancel}
      onPointerLeave={cancel}
      onPointerCancel={cancel}
      onKeyDown={(event) => {
        if ((event.key === 'Enter' || event.key === ' ') && timerRef.current === null) {
          event.preventDefault()
          start()
        }
      }}
      onKeyUp={cancel}
    >
      {icon}
    </button>
  )
}
