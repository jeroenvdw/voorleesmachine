export function CameraIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" aria-hidden="true">
      <path
        d="M4 8.5A2.5 2.5 0 0 1 6.5 6h1.2l1-1.6c.3-.5.8-.8 1.4-.8h3.8c.6 0 1.1.3 1.4.8l1 1.6h1.2A2.5 2.5 0 0 1 20 8.5v8A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5v-8Z"
        fill="#fff"
        stroke="none"
      />
      <circle cx="12" cy="12.5" r="4.2" fill="none" strokeWidth="2.2" />
    </svg>
  )
}

export default function App() {
  return (
    <main className="screen">
      <button className="big-button camera-start" style={{ backgroundColor: 'var(--green)' }} aria-label="Foto maken">
        <CameraIcon />
      </button>
    </main>
  )
}
