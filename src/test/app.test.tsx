import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import App from '../App'
import { makeTestServices } from './helpers'
import type { Services } from '../services'
import { L } from '../components/labels'

describe('Voorleesmachine happy flow', () => {
  it('doorloopt foto, review, denken en voorlezen helemaal', async () => {
    const user = userEvent.setup()
    render(<App services={makeTestServices({ delayMs: 200 })} />)

    await user.click(screen.getByRole('button', { name: L.takePhoto }))
    await user.click(await screen.findByRole('button', { name: L.shoot }))
    await user.click(await screen.findByRole('button', { name: L.readThis }))
    expect(await screen.findByRole('img', { name: L.thinking })).toBeInTheDocument()
    await screen.findByRole('button', { name: L.pause })

    expect(screen.getByLabelText(`${L.volume} 7 van 10`)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: L.louder }))
    expect(await screen.findByLabelText(`${L.volume} 8 van 10`)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: L.softer }))
    expect(await screen.findByLabelText(`${L.volume} 7 van 10`)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: L.pause }))
    expect(await screen.findByRole('button', { name: L.resume })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: L.resume }))
    expect(await screen.findByRole('button', { name: L.pause })).toBeInTheDocument()

    await screen.findByRole('button', { name: L.listenAgain })
    await user.click(screen.getByRole('button', { name: L.listenAgain }))
    expect(await screen.findByRole('button', { name: L.pause })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: L.nextPage }))
    await user.click(await screen.findByRole('button', { name: L.closeCamera }))
    expect(await screen.findByRole('button', { name: L.takePhoto })).toBeInTheDocument()
  })

  it('toont fout en herstel bij een niet-sprekende pagina', async () => {
    const user = userEvent.setup()
    render(<App services={makeTestServices({ errorKind: 'no-text-found' })} />)

    await user.click(screen.getByRole('button', { name: L.takePhoto }))
    await user.click(await screen.findByRole('button', { name: L.shoot }))
    await user.click(await screen.findByRole('button', { name: L.readThis }))
    expect(await screen.findByRole('img', { name: L.errorNoText })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: L.retry }))
    expect(await screen.findByRole('img', { name: L.errorNoText })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: L.goHome }))
    expect(await screen.findByRole('button', { name: L.takePhoto })).toBeInTheDocument()
  })

  it('toont een fout bij cameraproblemen', async () => {
    const user = userEvent.setup()
    const broken: Services = { ...makeTestServices(), camera: { open: () => Promise.reject(new Error('geen camera')) } }
    render(<App services={broken} />)

    await user.click(screen.getByRole('button', { name: L.takePhoto }))
    expect(await screen.findByRole('img', { name: L.errorCamera })).toBeInTheDocument()
  })
})
