/** Límites alineados con columnas BD / DTOs del backend. */
export const FIELD_LIMITS = {
  personName: { min: 2, max: 100 },
  orgName: { min: 2, max: 255 },
  industry: { max: 128 },
  email: { max: 254 },
  password: { min: 6, max: 128 },
  whatsapp: { max: 20 },
  sku: { min: 1, max: 64 },
  productName: { min: 1, max: 255 },
  barcode: { max: 100 },
  categoryName: { min: 1, max: 100 },
  supplierName: { min: 1, max: 255 },
  measureCode: { min: 1, max: 32 },
  measureName: { min: 1, max: 100 },
  note: { max: 500 },
  searchQuery: { max: 100 },
} as const

/** E.164 simplificado: opcional; si hay valor debe ser + y dígitos. */
export const WHATSAPP_INPUT_PATTERN = '^\\+?[0-9]{7,19}$'
