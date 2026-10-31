import { useEffect, useRef, useState } from 'react'
import type { CameraSession, ICamera } from '../../services/camera/ICamera'
import type { CapturedImage } from '../../domain/capturedImage'
import { CameraIcon, XIcon } from '../icons'
import { L } from '../labels'

export function CameraScreen({
  camera,
  mockMode,
  onPhotoTaken,
  onCancel,
  onCameraFailed,
}: {
  camera: ICamera
  mockMode: boolean
  onPhotoTaken: (image: CapturedImage) => void
  onCancel: () => void
  onCameraFailed: () => void
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const sessionRef = useRef<CameraSession | null>(null)
  const [ready, setReady] = useState(false)
  const [shooting, setShooting] = useState(false)

  useEffect(() => {
    let disposed = false
    let openedSession: CameraSession | null = null
    const video = videoRef.current
    camera
      .open(video)
      .then((session) => {
        if (disposed) {
          session.close()
          return
        }
        openedSession = session
        sessionRef.current = session
        setReady(true)
      })
      .catch(() => {
        if (!disposed) onCameraFailed()
      })
    return () => {
      disposed = true
      openedSession?.close()
      sessionRef.current = null
    }
  }, [camera, onCameraFailed])

  const shoot = async () => {
    const session = sessionRef.current
    if (!session || shooting) return
    setShooting(true)
    try {
      const image = await session.capture()
      onPhotoTaken(image)
    } catch {
      onCameraFailed()
    } finally {
      setShooting(false)
    }
  }

  return (
    <main className="screen camera-screen">
      <button type="button" className="corner-button" aria-label={L.closeCamera} onClick={onCancel}>
        <XIcon />
      </button>
      <div className="camera-frame">
        {mockMode ? <MockPagePreview /> : <video ref={videoRef} playsInline muted autoPlay />}
      </div>
      <button
        type="button"
        className={`shutter ${ready ? '' : 'disabled'}`}
        aria-label={L.shoot}
        disabled={!ready || shooting}
        onClick={() => void shoot()}
      >
        <CameraIcon />
      </button>
    </main>
  )
}

function MockPagePreview() {
  return (
    <div className="fake-page" aria-hidden="true">
      <div className="fake-page-title" />
      {Array.from({ length: 9 }, (_, index) => (
        <div key={index} className={`fake-page-line ${index % 5 === 4 ? 'short' : ''}`} />
      ))}
      <div className="fake-page-sun" />
    </div>
  )
}
