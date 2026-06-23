import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import StatCard from '@/components/StatCard'

describe('StatCard', () => {
  it('muestra etiqueta y valor', () => {
    render(<StatCard label="Productos" value={42} />)
    expect(screen.getByText('Productos')).toBeInTheDocument()
    expect(screen.getByText('42')).toBeInTheDocument()
  })

  it('muestra subtexto opcional', () => {
    render(<StatCard label="Stock bajo" value={3} subtext="Revisar hoy" />)
    expect(screen.getByText('Revisar hoy')).toBeInTheDocument()
  })
})
