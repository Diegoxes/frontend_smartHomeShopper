import { FIELD_LIMITS, WHATSAPP_INPUT_PATTERN } from './fieldLimits'

/** Una sola línea: quita saltos de línea al pegar texto largo. */
export function singleLine(value: string): string {
  return value.replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ')
}

export function clampLength(value: string, max: number): string {
  return value.slice(0, max)
}

export function singleLineMax(value: string, max: number): string {
  return clampLength(singleLine(value), max)
}

/** Solo dígitos y + inicial para WhatsApp. */
export function sanitizeWhatsApp(value: string): string {
  const trimmed = value.trim()
  if (!trimmed) return ''
  const hasPlus = trimmed.startsWith('+')
  const digits = trimmed.replace(/\D/g, '')
  const combined = (hasPlus ? '+' : '') + digits
  return clampLength(combined, FIELD_LIMITS.whatsapp.max)
}

export { FIELD_LIMITS, WHATSAPP_INPUT_PATTERN }
