import type { CapturedImage } from '../../domain/capturedImage'
import { CheckIcon, HomeIcon, RedoIcon } from '../icons'
import { L } from '../labels'

export function ReviewScreen({
  image,
  onRetake,
  onConfirm,
  onHome,
}: {
  image: CapturedImage
  onRetake: () => void
  onConfirm: () => void
  onHome: () => void
}) {
  return (
    <main className="screen review-screen">
      <button type="button" className="corner-button" aria-label={L.goHome} onClick={onHome}>
        <HomeIcon />
      </button>
      <div className="page-frame">
        <img src={image.previewUrl} alt="" />
      </div>
      <div className="button-row">
        <button type="button" className="big-button lg btn-orange" aria-label={L.retake} onClick={onRetake}>
          <RedoIcon />
        </button>
        <button type="button" className="big-button xl btn-green" aria-label={L.readThis} onClick={onConfirm}>
          <CheckIcon />
        </button>
      </div>
    </main>
  )
}
