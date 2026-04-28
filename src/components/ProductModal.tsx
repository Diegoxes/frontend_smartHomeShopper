import { useState } from 'react'
import type { Product, CreateProductRequest, UnitType } from '@/types'
import { UNIT_OPTIONS, CATEGORIES } from '@/types'
import { useCreateProduct, useUpdateProduct } from '@/hooks/useProducts'

interface Props {
  product?: Product
  onClose: () => void
}

type FormState = {
  name: string
  quantity: string
  minQuantity: string
  unit: UnitType
  consumptionPerUse: string
  category: string
  expiryDate: string
}

export default function ProductModal({ product, onClose }: Props) {
  const create = useCreateProduct()
  const update = useUpdateProduct()

  const [form, setForm] = useState<FormState>({
    name:             product?.name ?? '',
    quantity:         String(product?.quantity ?? 1),
    minQuantity:      String(product?.minQuantity ?? 1),
    unit:             product?.unit ?? 'UNIT',
    consumptionPerUse: String(product?.consumptionPerUse ?? 1),
    category:         product?.category ?? '',
    expiryDate:       product?.expiryDate ?? '',
  })

  const set = (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [key]: e.target.value }))

  const busy = create.isPending || update.isPending

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const body: CreateProductRequest = {
      name:             form.name,
      quantity:         parseFloat(form.quantity),
      minQuantity:      parseFloat(form.minQuantity),
      unit:             form.unit,
      consumptionPerUse: parseFloat(form.consumptionPerUse),
      category:         form.category || null,
      expiryDate:       form.expiryDate || null,
    }
    if (product) {
      await update.mutateAsync({ id: product.id, data: body })
    } else {
      await create.mutateAsync(body)
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-md card p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-base font-semibold text-gray-800 mb-5">
          {product ? 'Editar producto' : '+ Agregar producto'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* name */}
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">Nombre *</label>
            <input className="input" placeholder="Ej: Leche entera" value={form.name} onChange={set('name')} required />
          </div>

          {/* quantity + minQuantity */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1">Cantidad actual</label>
              <input className="input" type="number" min="0" step="0.1" value={form.quantity} onChange={set('quantity')} />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1">Stock mínimo</label>
              <input className="input" type="number" min="0" step="0.1" value={form.minQuantity} onChange={set('minQuantity')} />
            </div>
          </div>

          {/* unit + consumptionPerUse */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1">Unidad</label>
              <select className="input" value={form.unit} onChange={set('unit')}>
                {UNIT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1">Consumo por uso</label>
              <input className="input" type="number" min="0.01" step="0.01" value={form.consumptionPerUse} onChange={set('consumptionPerUse')} />
            </div>
          </div>

          {/* category */}
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">Categoría</label>
            <select className="input" value={form.category} onChange={set('category')}>
              <option value="">Sin categoría</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* expiry */}
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">Fecha de vencimiento (opcional)</label>
            <input className="input" type="date" value={form.expiryDate} onChange={set('expiryDate')} />
          </div>

          {/* actions */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
            <button type="submit" disabled={busy} className="btn-primary flex-1">
              {busy ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
