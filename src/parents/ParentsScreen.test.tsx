import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { ParentsScreen } from './ParentsScreen'
import { loadSettings } from './settings'
import { L } from '../components/labels'

describe('ParentsScreen', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('bewaart de sleutel en het model', async () => {
    const user = userEvent.setup()
    render(<ParentsScreen onBack={() => {}} />)

    await user.type(screen.getByLabelText('Geheime sleutel (OpenRouter)'), 'sk-or-test-123')
    await user.clear(screen.getByLabelText('AI-model'))
    await user.type(screen.getByLabelText('AI-model'), 'google/gemini-2.0-flash-001')
    await user.click(screen.getByRole('button', { name: L.saveSettings }))

    expect(loadSettings(window.localStorage)).toEqual({
      apiKey: 'sk-or-test-123',
      model: 'google/gemini-2.0-flash-001',
    })
    expect(screen.getByRole('img', { name: L.keyStored })).toBeInTheDocument()
  })

  it('toont bij het openen de opgeslagen instellingen', () => {
    window.localStorage.setItem(
      'voorleesmachine:settings',
      JSON.stringify({ apiKey: 'sk-or-bestaand', model: 'mijn-model' }),
    )
    render(<ParentsScreen onBack={() => {}} />)
    expect(screen.getByLabelText('Geheime sleutel (OpenRouter)')).toHaveValue('sk-or-bestaand')
    expect(screen.getByLabelText('AI-model')).toHaveValue('mijn-model')
  })
})
