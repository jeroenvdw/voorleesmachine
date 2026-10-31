import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from '../App'

describe('App', () => {
  it('toont het startscherm met een fotoknop', () => {
    render(<App />)
    expect(screen.getByRole('button', { name: 'Foto maken' })).toBeInTheDocument()
  })
})
