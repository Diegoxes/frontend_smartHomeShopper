import { describe, it, expect } from 'vitest'
import { unitSelectOptions, UNIT_OPTIONS, UNIT_LABELS } from '@/types'

describe('unitSelectOptions', () => {
  it('devuelve opciones retail por defecto', () => {
    expect(unitSelectOptions()).toEqual(UNIT_OPTIONS)
  })

  it('añade unidad legacy si el producto usa kg/L/g/ml', () => {
    const opts = unitSelectOptions('KG')
    expect(opts.some(o => o.value === 'KG')).toBe(true)
    expect(opts.find(o => o.value === 'KG')?.label).toContain('kg')
    expect(UNIT_LABELS.KG).toBe('kg')
  })
})
