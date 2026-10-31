import type { ReactNode } from 'react'

type IconProps = {
  className?: string
}

function Svg({ className, children }: IconProps & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  )
}

export function CameraIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </Svg>
  )
}

export function GalleryIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="M21 15l-5-5L5 21" />
    </Svg>
  )
}

export function CheckIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M20 6L9 17l-5-5" />
    </Svg>
  )
}

export function RedoIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <polyline points="1 4 1 10 7 10" />
      <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
    </Svg>
  )
}

export function XIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M18 6L6 18" />
      <path d="M6 6l12 12" />
    </Svg>
  )
}

export function PlayIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M8 5.2v13.6L19.2 12z" fill="currentColor" stroke="none" />
    </Svg>
  )
}

export function PauseIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <rect x="6.5" y="5" width="4" height="14" rx="1.6" fill="currentColor" stroke="none" />
      <rect x="13.5" y="5" width="4" height="14" rx="1.6" fill="currentColor" stroke="none" />
    </Svg>
  )
}

export function VolumeUpIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M11 5L6 9H2v6h4l5 4z" fill="currentColor" stroke="none" />
      <path d="M15.5 8.5a5 5 0 0 1 0 7" />
      <path d="M18.8 6a9.5 9.5 0 0 1 0 12" />
    </Svg>
  )
}

export function VolumeDownIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M11 5L6 9H2v6h4l5 4z" fill="currentColor" stroke="none" />
      <path d="M15.5 8.5a5 5 0 0 1 0 7" />
    </Svg>
  )
}

export function SpeakerSlashIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M11 5L6 9H2v6h4l5 4z" fill="currentColor" stroke="none" />
      <path d="M15.5 9.5l5 5" />
      <path d="M20.5 9.5l-5 5" />
      <Slash />
    </Svg>
  )
}

export function NextPageIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M2 5h5.5A3.5 3.5 0 0 1 11 8.5V20a3 3 0 0 0-3-3H2z" />
      <path d="M22 5h-5.5A3.5 3.5 0 0 0 13 8.5V20a3 3 0 0 1 3-3h6z" />
      <path d="M15 1.5h6.5V8" />
      <path d="M21.5 1.5L14.5 8.5" />
    </Svg>
  )
}

export function HomeIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M3 10.8L12 3l9 7.8" />
      <path d="M5.2 9.5V21h13.6V9.5" />
    </Svg>
  )
}

export function GearIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path
        d="M19.14 12.94c.04-.31.06-.62.06-.94s-.02-.63-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.49.49 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.48.48 0 0 0-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96a.48.48 0 0 0-.59.22L4.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.31-.09.63-.09.94s.02.63.07.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32a.49.49 0 0 0-.12-.61l-2.01-1.58zM12 15.6a3.6 3.6 0 1 1 0-7.2 3.6 3.6 0 0 1 0 7.2z"
        fill="currentColor"
        stroke="none"
      />
    </Svg>
  )
}

function Slash() {
  return <path d="M3.5 3.5l17 17" stroke="#dc2626" strokeWidth={3.2} />
}

export function CameraSlashIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
      <Slash />
    </Svg>
  )
}

export function WifiSlashIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M2 8.8a15.5 15.5 0 0 1 20 0" />
      <path d="M5.5 12.5a10.5 10.5 0 0 1 13 0" />
      <path d="M9 16.2a5.4 5.4 0 0 1 6 0" />
      <circle cx="12" cy="19.6" r="1.4" fill="currentColor" stroke="none" />
      <Slash />
    </Svg>
  )
}

export function KeySlashIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <circle cx="7.5" cy="15.5" r="4.5" />
      <path d="M10.7 12.3L21 2" />
      <path d="M15.5 7.5l3 3" />
      <Slash />
    </Svg>
  )
}

export function DocSlashIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
      <path d="M8 13.5h8M8 17.5h5" />
      <Slash />
    </Svg>
  )
}

export function AlertIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.2v6" />
      <circle cx="12" cy="16.6" r="1.4" fill="currentColor" stroke="none" />
    </Svg>
  )
}

export function ImageSlashIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="9" cy="9.5" r="1.6" />
      <path d="M21 15l-4.5-4.5L7 20" />
      <Slash />
    </Svg>
  )
}
