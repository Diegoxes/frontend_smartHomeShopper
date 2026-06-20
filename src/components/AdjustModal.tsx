import { useEffect, useMemo, useState } from 'react'
import type { Product, MeasureUnit } from '@/types'
import { UNIT_LABELS } from '@/types'
import { useConsumeProduct, useRestockProduct } from '@/hooks/useProducts'
import { measureUnitService, supplierService } from '@/services/api'
import type { Supplier } from '@/types'
import { LuX, LuMinus, LuPlus, LuDollarSign, LuStore, LuFileText } from 'react-icons/lu'

interface Props {
  product: Product
  mode: 'consume' | 'restock'
  onClose: () => void
}

type CostMode = 'PER_BASE' | 'PER_PACKAGE'

function parseNum(v: string): number | undefined {
  const n = parseFloat(v)
  return Number.isFinite(n) ? n : undefined
}

export default function AdjustModal({ product, mode, onClose }: Props) {
  const consume = useConsumeProduct()
  const restock = useRestockProduct()
  const defaultPrice = product.avgCost ?? product.lastCost

  const uoms = product.productUoms ?? []
  const boxUom = uoms.find(u => u.code === 'BOX') ?? uoms[0]
  const boxFactor = boxUom?.factorToBase ?? (
    product.unitsPerPurchaseUnit != null && product.unitsPerPurchaseUnit > 1
      ? product.unitsPerPurchaseUnit : null
  )

  const [measureUnits, setMeasureUnits] = useState<MeasureUnit[]>([])
  const [measureUnitId, setMeasureUnitId] = useState('')
  const [amount, setAmount] = useState('1')
  const [note, setNote] = useState('')
  const [costMode, setCostMode] = useState<CostMode>(boxFactor ? 'PER_PACKAGE' : 'PER_BASE')
  const [packagePrice, setPackagePrice] = useState('')
  const [unitPrice, setUnitPrice] = useState(defaultPrice != null ? String(defaultPrice) : '')
  const [supplierId, setSupplierId] = useState('')
  const [suppliers, setSuppliers] = useState<Supplier[]>([])

  useEffect(() => {
    measureUnitService.list().then(setMeasureUnits).catch(() => {})
    if (mode === 'restock') supplierService.list().then(setSuppliers).catch(() => {})
  }, [mode])

  useEffect(() => {
    if (mode === 'restock' && boxUom) setMeasureUnitId(boxUom.measureUnitId)
    else {
      const base = measureUnits.find(m => m.baseUnit)
      if (base) setMeasureUnitId(base.id)
    }
  }, [measureUnits, boxUom, mode])

  const selectedUom = measureUnits.find(m => m.id === measureUnitId)
  const factor = useMemo(() => {
    if (!selectedUom || selectedUom.baseUnit) return 1
    const fromProduct = uoms.find(u => u.measureUnitId === measureUnitId)
    if (fromProduct) return fromProduct.factorToBase
    if (selectedUom.code === 'BOX' && boxFactor) return boxFactor
    return 1
  }, [selectedUom, measureUnitId, uoms, boxFactor])

  const inputQty = parseNum(amount) ?? 0
  const stockPreview = inputQty * factor

  const suggestedUnitPrice = useMemo(() => {
    if (costMode !== 'PER_PACKAGE' || !boxFactor || !packagePrice) return null
    const pkg = parseNum(packagePrice)
    if (pkg == null) return null
    return (pkg / boxFactor).toFixed(2)
  }, [costMode, boxFactor, packagePrice])

  const busy = consume.isPending || restock.isPending
  const isConsume = mode === 'consume'
  const unitKey = (typeof product.unit === 'string' ? product.unit : 'UNIT') as keyof typeof UNIT_LABELS

  const handleSave = async () => {
    let confirmedUnitPrice = unitPrice ? parseFloat(unitPrice) : undefined
    if (costMode === 'PER_PACKAGE' && suggestedUnitPrice && !unitPrice) {
      confirmedUnitPrice = parseFloat(suggestedUnitPrice)
    }

    const data = {
      amount: inputQty,
      note: note || undefined,
      supplierId: supplierId || undefined,
      unitPrice: confirmedUnitPrice,
      measureUnitId: measureUnitId || undefined,
      packagePrice: costMode === 'PER_PACKAGE' && packagePrice ? parseFloat(packagePrice) : undefined,
      costInputMode: costMode,
    }
    if (mode === 'consume') await consume.mutateAsync({ id: product.id, data })
    else await restock.mutateAsync({ id: product.id, data })
    onClose()
  }

  const restockUomOptions = measureUnits.filter(m => m.baseUnit || uoms.some(u => u.measureUnitId === m.id) || m.code === 'BOX')

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-md card p-0 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className={`flex items-center justify-between px-6 py-4 border-b border-gray-200 shrink-0 ${isConsume ? 'bg-gradient-to-r from-amber-50 to-white' : 'bg-gradient-to-r from-accent-50 to-white'}`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isConsume ? 'bg-amber-100' : 'bg-accent-100'}`}>
              {isConsume ? <LuMinus className="w-5 h-5 text-amber-600" /> : <LuPlus className="w-5 h-5 text-accent-600" />}
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">
                {isConsume ? 'Registrar venta/consumo' : 'Entrada de mercancía'}
              </h2>
              <p className="text-xs text-slate-600">{product.name}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100">
            <LuX className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4 overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">Cantidad</label>
              <input className="input text-lg font-semibold" type="number" min="1" step="1" value={amount} onChange={e => setAmount(e.target.value)} autoFocus />
            </div>
            {!isConsume && restockUomOptions.length > 0 && (
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">Unidad</label>
                <select className="input" value={measureUnitId} onChange={e => setMeasureUnitId(e.target.value)}>
                  {restockUomOptions.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {!isConsume && factor > 1 && (
            <p className="text-xs text-brand-700 bg-brand-50 rounded-lg px-3 py-2">
              Sumará <strong>{stockPreview}</strong> unidades al inventario ({inputQty} × {factor}).
            </p>
          )}
          {isConsume && (
            <p className="text-xs text-slate-500">Cantidad en {UNIT_LABELS[unitKey] ?? 'unidades'} (normalmente 1 por venta).</p>
          )}

          {!isConsume && (
            <>
              <div>
                <p className="text-xs font-semibold text-slate-600 mb-2">Costo de compra (opcional)</p>
                <div className="flex gap-4 mb-3">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="radio" checked={costMode === 'PER_PACKAGE'} onChange={() => setCostMode('PER_PACKAGE')} disabled={!boxFactor} />
                    Por {selectedUom?.name?.toLowerCase() ?? 'caja'}
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="radio" checked={costMode === 'PER_BASE'} onChange={() => setCostMode('PER_BASE')} />
                    Por unidad
                  </label>
                </div>
                {costMode === 'PER_PACKAGE' ? (
                  <>
                    <input className="input" type="number" min="0" step="0.01" placeholder="Precio por caja/paquete" value={packagePrice} onChange={e => setPackagePrice(e.target.value)} />
                    {suggestedUnitPrice && (
                      <p className="text-xs text-slate-500 mt-1">
                        Sugerido: S/{suggestedUnitPrice} por unidad (editable abajo).
                      </p>
                    )}
                  </>
                ) : null}
                <label className="text-xs font-semibold text-slate-600 block mb-1.5 mt-3 flex items-center gap-1.5">
                  <LuDollarSign className="w-3.5 h-3.5" />
                  Costo por unidad (confirmado)
                </label>
                <input className="input" type="number" min="0" step="0.01" placeholder="0.00" value={unitPrice} onChange={e => setUnitPrice(e.target.value)} />
                <p className="text-xs text-slate-500 mt-1">Tú decides el costo; la sugerencia no se guarda sola.</p>
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
            <input className="input" placeholder="Agregar una nota..." value={note} onChange={e => setNote(e.target.value)} />
          </div>
        </div>

        <div className="flex gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50 shrink-0">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">
            <LuX className="w-4 h-4" />
            Cancelar
          </button>
          <button type="button" onClick={handleSave} disabled={busy || inputQty <= 0} className={`flex-1 btn-primary ${isConsume ? '!bg-amber-500 hover:!bg-amber-600' : '!bg-accent-500 hover:!bg-accent-600'}`}>
            {isConsume ? <LuMinus className="w-4 h-4" /> : <LuPlus className="w-4 h-4" />}
            {busy ? 'Guardando...' : isConsume ? 'Registrar' : 'Registrar entrada'}
          </button>
        </div>
      </div>
    </div>
  )
}
