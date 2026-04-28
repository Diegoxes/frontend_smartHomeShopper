import { useState } from 'react'
import type { Product } from '@/types'
import { UNIT_LABELS } from '@/types'
import { useConsumeProduct, useRestockProduct } from '@/hooks/useProducts'

interface Props {
  product: Product
  mode: 'consume' | 'restock'
  onClose: () => void
}

export default function AdjustModal({ product, mode, onClose }: Props) {
  const consume = useConsumeProduct()
  const restock = useRestockProduct()
  const [amount, setAmount] = useState(String(product.consumptionPerUse || 1))
  const [note,   setNote]   = useState('')

  const busy = consume.isPending || restock.isPending

  const handleSave = async () => {
    const data = { amount: parseFloat(amount), note: note || undefined }
    if (mode === 'consume') await consume.mutateAsync({ id: product.id, data })
    else                    await restock.mutateAsync({ id: product.id, data })
    onClose()
  }

  const isConsume = mode === 'consume'

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-sm card p-6">
        <h2 className="text-sm font-semibold text-gray-800 mb-1">
          {isConsume ? '− Registrar consumo' : '+ Reponer stock'}
        </h2>
        <p className="text-xs text-gray-400 mb-4">{product.name}</p>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">
              Cantidad ({UNIT_LABELS[product.unit]})
            </label>
            <input
              className="input"
              type="number" min="0.01" step="0.01"
              value={amount}
              onChange={e => setAmount(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">Nota (opcional)</label>
            <input className="input" placeholder="Ej: para el desayuno" value={note} onChange={e => setNote(e.target.value)} />
          </div>

          <div className="flex gap-3 pt-1">
            <button onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
            <button
              onClick={handleSave}
              disabled={busy}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 text-white
                ${isConsume ? 'bg-amber-500 hover:bg-amber-600' : 'bg-brand-500 hover:bg-brand-600'}`}
            >
              {busy ? 'Guardando...' : isConsume ? 'Registrar' : 'Reponer'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
