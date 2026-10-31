import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react'
import { appReducer, initialState, VOLUME_MAX } from '../domain/state'
import { disposeCapturedImage, type CapturedImage } from '../domain/capturedImage'
import { isValidText } from '../domain/textValidation'
import { mapOcrErrorToAppError } from '../domain/ocrErrors'
import type { Services } from '../services'
import { createCapturedImageFromFile } from '../lib/imageFromBlob'

export type VoorleesActions = {
  openCamera: () => void
  closeCamera: () => void
  onPhotoTaken: (image: CapturedImage) => void
  onPhotoRejected: () => void
  onPhotoConfirmed: () => void
  onCameraFailed: () => void
  onImageUnreadable: () => void
  openGalleryFile: (file: File) => Promise<void>
  togglePause: () => void
  volumeUp: () => void
  volumeDown: () => void
  nextPage: () => void
  goHome: () => void
  retryFromError: () => void
}

export function useVoorlees(services: Services) {
  const [state, dispatch] = useReducer(appReducer, initialState)
  const stateRef = useRef(state)
  stateRef.current = state

  useEffect(() => {
    const unsubscribe = services.tts.onStateChange((ttsState) => {
      dispatch({ type: 'tts-state-changed', ttsState })
    })
    return unsubscribe
  }, [services])

  useEffect(() => {
    if (state.screen === 'reading') return
    services.tts.stop()
  }, [services, state.screen])

  useEffect(() => {
    services.tts.setVolume(state.volume / VOLUME_MAX)
  }, [services, state.volume])

  const lastImageRef = useRef<CapturedImage | null>(null)
  useEffect(() => {
    const previous = lastImageRef.current
    if (previous && previous.id !== state.image?.id) disposeCapturedImage(previous)
    lastImageRef.current = state.image
  }, [state.image])

  useEffect(() => {
    if (state.screen !== 'processing' || !state.image) return
    const image = state.image
    const controller = new AbortController()
    let cancelled = false
    const attempt = async (retriesLeft: number): Promise<void> => {
      try {
        const text = await services.ocr.recognize(image.blob, controller.signal)
        if (cancelled) return
        if (!isValidText(text)) {
          if (retriesLeft > 0) {
            await attempt(retriesLeft - 1)
            return
          }
          dispatch({ type: 'ocr-failed', error: 'no-text-found' })
          return
        }
        dispatch({ type: 'ocr-succeeded', text })
      } catch (error) {
        if (cancelled) return
        dispatch({ type: 'ocr-failed', error: mapOcrErrorToAppError(error) })
      }
    }
    void attempt(1)
    return () => {
      cancelled = true
      controller.abort()
    }
  }, [services, state.image, state.screen])

  useEffect(() => {
    if (state.screen !== 'reading' || !state.text || state.ttsState !== 'idle') return
    services.tts.speak(state.text, { volume: state.volume / VOLUME_MAX })
  }, [services, state.screen, state.text, state.ttsState, state.volume])

  const openGalleryFile = useCallback(
    async (file: File) => {
      try {
        const image = await createCapturedImageFromFile(file)
        dispatch({ type: 'photo-taken', image })
      } catch {
        dispatch({ type: 'gallery-failed' })
      }
    },
    [],
  )

  const actions = useMemo<VoorleesActions>(
    () => ({
      openCamera: () => dispatch({ type: 'open-camera' }),
      closeCamera: () => dispatch({ type: 'close-camera' }),
      onPhotoTaken: (image) => dispatch({ type: 'photo-taken', image }),
      onPhotoRejected: () => dispatch({ type: 'photo-rejected' }),
      onPhotoConfirmed: () => dispatch({ type: 'photo-confirmed' }),
      onCameraFailed: () => dispatch({ type: 'camera-failed' }),
      onImageUnreadable: () => dispatch({ type: 'gallery-failed' }),
      openGalleryFile,
      togglePause: () => {
        const ttsState = stateRef.current.ttsState
        if (ttsState === 'speaking') services.tts.pause()
        else if (ttsState === 'paused') services.tts.resume()
        else dispatch({ type: 'tts-state-changed', ttsState: 'idle' })
      },
      volumeUp: () => dispatch({ type: 'volume-up' }),
      volumeDown: () => dispatch({ type: 'volume-down' }),
      nextPage: () => dispatch({ type: 'next-page' }),
      goHome: () => dispatch({ type: 'go-home' }),
      retryFromError: () => dispatch({ type: 'retry' }),
    }),
    [openGalleryFile, services],
  )

  return { state, actions }
}
