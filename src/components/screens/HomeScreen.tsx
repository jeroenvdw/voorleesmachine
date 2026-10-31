import { useRef } from 'react'
import type { VoorleesActions } from '../useVoorlees'
import { HoldToOpenButton } from '../HoldToOpenButton'
import { CameraIcon, GalleryIcon, GearIcon } from '../icons'
import { L } from '../labels'

export function HomeScreen({
  onOpenParents,
  actions,
}: {
  onOpenParents: () => void
  actions: Pick<VoorleesActions, 'openCamera' | 'openGalleryFile'>
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  return (
    <main className="screen home-screen">
      <HoldToOpenButton label={L.parents} icon={<GearIcon />} onOpen={onOpenParents} />
      <button
        type="button"
        className="big-button xl btn-green"
        aria-label={L.takePhoto}
        onClick={actions.openCamera}
      >
        <CameraIcon />
      </button>
      <button
        type="button"
        className="big-button lg btn-orange"
        aria-label={L.chooseFromGallery}
        onClick={() => fileInputRef.current?.click()}
      >
        <GalleryIcon />
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden-input"
        tabIndex={-1}
        aria-hidden="true"
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (file) void actions.openGalleryFile(file)
          event.target.value = ''
        }}
      />
    </main>
  )
}
