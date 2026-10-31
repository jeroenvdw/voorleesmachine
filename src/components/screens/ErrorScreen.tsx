import type { AppErrorCode } from '../../domain/types'
import {
  AlertIcon,
  CameraSlashIcon,
  DocSlashIcon,
  HomeIcon,
  ImageSlashIcon,
  KeySlashIcon,
  RedoIcon,
  WifiSlashIcon,
} from '../icons'
import { L } from '../labels'

function ErrorGlyph({ code }: { code: AppErrorCode | null }) {
  switch (code) {
    case 'no-text-found':
      return <DocSlashIcon className="error-glyph" />
    case 'camera-unavailable':
      return <CameraSlashIcon className="error-glyph" />
    case 'no-internet':
      return <WifiSlashIcon className="error-glyph" />
    case 'no-api-key':
      return <KeySlashIcon className="error-glyph" />
    case 'bad-image':
      return <ImageSlashIcon className="error-glyph" />
    default:
      return <AlertIcon className="error-glyph" />
  }
}

function errorLabel(code: AppErrorCode | null): string {
  switch (code) {
    case 'no-text-found':
      return L.errorNoText
    case 'camera-unavailable':
      return L.errorCamera
    case 'no-internet':
      return L.errorInternet
    case 'no-api-key':
      return L.errorApiKey
    case 'bad-image':
      return L.errorImage
    default:
      return L.errorOcr
  }
}

export function ErrorScreen({
  error,
  onRetry,
  onHome,
}: {
  error: AppErrorCode | null
  onRetry: () => void
  onHome: () => void
}) {
  return (
    <main className="screen error-screen">
      <div className="error-wrap" role="img" aria-label={errorLabel(error)}>
        <ErrorGlyph code={error} />
      </div>
      <button type="button" className="big-button xl btn-green" aria-label={L.retry} onClick={onRetry}>
        <RedoIcon />
      </button>
      <button type="button" className="big-button md btn-slate" aria-label={L.goHome} onClick={onHome}>
        <HomeIcon />
      </button>
    </main>
  )
}
