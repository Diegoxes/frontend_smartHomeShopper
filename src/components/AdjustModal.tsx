import { useEffect, useState } from 'react'
import type { Product } from '@/types'
import { UNIT_LABELS } from '@/types'
import { useConsumeProduct, useRestockProduct } from '@/hooks/useProducts'
import { supplierService } from '@/services/api'
import type { Supplier } from '@/types'
import { LuX, LuMinus, LuPlus, LuDollarSign, LuStore, LuFileText } from 'react-icons/lu'

interface Props {
  product: Product
  mode: 'consume' | 'restock'
  onClose: () => void
}

export default function AdjustModal({ product, mode, onClose }: Props) {
  const consume = useConsumeProduct()
  const restock = useRestockProduct()
  const [amount, setAmount] = useState(String(product.consumptionPerUse || 1))
  const [note, setNote] = useState('')
  const [unitPrice, setUnitPrice] = useState('')
  const [supplierId, setSupplierId] = useState('')
  const [suppliers, setSuppliers] = useState<Supplier[]>([])

  useEffect(() => {
    if (mode === 'restock') supplierService.list().then(setSuppliers).catch(() => {})
  }, [mode])

  const busy = consume.isPending || restock.isPending

  const handleSave = async () => {
    const data = {
      amount: parseFloat(amount),
      note: note || undefined,
      supplierId: supplierId || undefined,
      unitPrice: unitPrice ? parseFloat(unitPrice) : undefined,
    }
    if (mode === 'consume') await consume.mutateAsync({ id: product.id, data })
    else await restock.mutateAsync({ id: product.id, data })
    onClose()
  }

  const isConsume = mode === 'consume'
  const unitKey = (typeof product.unit === 'string' ? product.unit : 'UNIT') as keyof typeof UNIT_LABELS

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-md card p-0 shadow-2xl overflow-hidden">
        <div className={`flex items-center justify-between px-6 py-4 border-b border-gray-200 ${isConsume ? 'bg-gradient-to-r from-amber-50 to-white' : 'bg-gradient-to-r from-accent-50 to-white'}`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isConsume ? 'bg-amber-100' : 'bg-accent-100'}`}>
              {isConsume ? (
                <LuMinus className={`w-5 h-5 ${isConsume ? 'text-amber-600' : 'text-accent-600'}`} />
              ) : (
                <LuPlus className={`w-5 h-5 text-accent-600`} />
              )}
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">
                {isConsume ? 'Registrar consumo' : 'Reponer stock'}
              </h2>
              <p className="text-xs text-slate-600">{product.name}</p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
          >
            <LuX className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1.5">
              Cantidad ({UNIT_LABELS[unitKey] ?? product.unit})
            </label>
            <input 
              className="input text-lg font-semibold" 
              type="number" 
              min="0.01" 
              step="0.01" 
              value={amount} 
              onChange={e => setAmount(e.target.value)} 
              autoFocus
            />
          </div>
          {!isConsume && (
            <>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5 flex items-center gap-1.5">
                  <LuDollarSign className="w-3.5 h-3.5" />
                  Precio unitario (opcional)
                </label>
                <input 
                  className="input" 
                  type="number" 
                  min="0" 
                  step="0.01" 
                  placeholder="0.00"
                  value={unitPrice} 
                  onChange={e => setUnitPrice(e.target.value)} 
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5 flex items-center gap-1.5">
                  <LuStore className="w-3.5 h-3.5" />
                  Proveedor (opcional)
                </label>
                <select className="input" value={supplierId} onChange={e => setSupplierId(e.target.value)}>
                  <option value="">Seleccionar proveedor</option>
                  {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            </>
          )}
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1.5 flex items-center gap-1.5">
              <LuFileText className="w-3.5 h-3.5" />
              Nota (opcional)
            </label>
            <input 
              className="input" 
              placeholder="Agregar una nota..."
              value={note} 
              onChange={e => setNote(e.target.value)} 
            />
          </div>
        </div>

        <div className="flex gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">
            <LuX className="w-4 h-4" />
            Cancelar
          </button>
          <button 
            type="button" 
            onClick={handleSave} 
            disabled={busy} 
            className={`flex-1 btn-primary ${isConsume ? '!bg-amber-500 hover:!bg-amber-600' : '!bg-accent-500 hover:!bg-accent-600'}`}
          >
            {isConsume ? <LuMinus className="w-4 h-4" /> : <LuPlus className="w-4 h-4" />}
            {busy ? 'Guardando...' : isConsume ? 'Registrar' : 'Reponer'}
          </button>
        </div>
      </div>
    </div>
  )
}
