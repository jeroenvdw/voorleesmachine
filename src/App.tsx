import { useMemo, useState } from 'react'
import { createServices, isMockMode, type Services } from './services'
import { useVoorlees } from './components/useVoorlees'
import { useScreenWakeLock } from './components/useWakeLock'
import { HomeScreen } from './components/screens/HomeScreen'
import { CameraScreen } from './components/screens/CameraScreen'
import { ReviewScreen } from './components/screens/ReviewScreen'
import { ProcessingScreen } from './components/screens/ProcessingScreen'
import { ReadingScreen } from './components/screens/ReadingScreen'
import { ErrorScreen } from './components/screens/ErrorScreen'
import { ParentsScreen } from './parents/ParentsScreen'

type AppProps = {
  services?: Services
}

export default function App({ services: injectedServices }: AppProps = {}) {
  useScreenWakeLock()
  const services = useMemo(
    () => injectedServices ?? createServices(isMockMode()),
    [injectedServices],
  )
  const mockMode = injectedServices ? true : isMockMode()
  const { state, actions } = useVoorlees(services)
  const [parentsOpen, setParentsOpen] = useState(false)

  if (parentsOpen) return <ParentsScreen onBack={() => setParentsOpen(false)} />

  switch (state.screen) {
    case 'home':
      return (
        <HomeScreen
          onOpenParents={() => setParentsOpen(true)}
          actions={actions}
        />
      )
    case 'camera':
      return (
        <CameraScreen
          camera={services.camera}
          mockMode={mockMode}
          onPhotoTaken={actions.onPhotoTaken}
          onCancel={actions.closeCamera}
          onCameraFailed={actions.onCameraFailed}
        />
      )
    case 'review':
      return state.image ? (
        <ReviewScreen
          image={state.image}
          onRetake={actions.onPhotoRejected}
          onConfirm={actions.onPhotoConfirmed}
          onHome={actions.goHome}
        />
      ) : null
    case 'processing':
      return <ProcessingScreen onCancel={actions.goHome} />
    case 'reading':
      return (
        <ReadingScreen
          ttsState={state.ttsState}
          volume={state.volume}
          onTogglePause={actions.togglePause}
          onLouder={actions.volumeUp}
          onSofter={actions.volumeDown}
          onNextPage={actions.nextPage}
          onHome={actions.goHome}
        />
      )
    case 'error':
      return (
        <ErrorScreen
          error={state.error}
          onRetry={actions.retryFromError}
          onNextPage={actions.nextPage}
          onHome={actions.goHome}
        />
      )
  }
}
