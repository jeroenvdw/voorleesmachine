import type { TtsState } from '../../domain/types'
import { VOLUME_MAX } from '../../domain/state'
import {
  HomeIcon,
  NextPageIcon,
  PauseIcon,
  PlayIcon,
  RedoIcon,
  SpeakerSlashIcon,
  VolumeDownIcon,
  VolumeUpIcon,
} from '../icons'
import { L } from '../labels'

export function ReadingScreen({
  ttsState,
  volume,
  onTogglePause,
  onLouder,
  onSofter,
  onNextPage,
  onHome,
}: {
  ttsState: TtsState
  volume: number
  onTogglePause: () => void
  onLouder: () => void
  onSofter: () => void
  onNextPage: () => void
  onHome: () => void
}) {
  if (ttsState === 'failed') {
    return (
      <main className="screen reading-screen">
        <div className="error-wrap" role="img" aria-label={L.errorTts}>
          <SpeakerSlashIcon className="error-glyph" />
        </div>
        <button type="button" className="big-button xl btn-green" aria-label={L.nextPage} onClick={onNextPage}>
          <NextPageIcon />
        </button>
        <div className="button-row">
          <button type="button" className="big-button md btn-slate" aria-label={L.goHome} onClick={onHome}>
            <HomeIcon />
          </button>
          <button type="button" className="big-button md btn-orange" aria-label={L.retry} onClick={onTogglePause}>
            <RedoIcon />
          </button>
        </div>
      </main>
    )
  }

  const mainIcon = ttsState === 'speaking' ? <PauseIcon /> : <PlayIcon />
  const mainLabel = ttsState === 'speaking' ? L.pause : ttsState === 'paused' ? L.resume : L.listenAgain

  return (
    <main className="screen reading-screen">
      <div className="volume-cluster">
        <button type="button" className="big-button md btn-blue" aria-label={L.softer} onClick={onSofter}>
          <VolumeDownIcon />
        </button>
        <div className="volume-dots" role="img" aria-label={`${L.volume} ${volume} van ${VOLUME_MAX}`}>
          {Array.from({ length: VOLUME_MAX }, (_, index) => (
            <span key={index} className={`dot ${index < volume ? 'on' : ''}`} />
          ))}
        </div>
        <button type="button" className="big-button md btn-blue" aria-label={L.louder} onClick={onLouder}>
          <VolumeUpIcon />
        </button>
      </div>
      <button type="button" className="big-button xl btn-blue" aria-label={mainLabel} onClick={onTogglePause}>
        {mainIcon}
      </button>
      <div className="button-row">
        <button type="button" className="big-button md btn-slate" aria-label={L.goHome} onClick={onHome}>
          <HomeIcon />
        </button>
        <button type="button" className="big-button lg btn-green" aria-label={L.nextPage} onClick={onNextPage}>
          <NextPageIcon />
        </button>
      </div>
    </main>
  )
}
