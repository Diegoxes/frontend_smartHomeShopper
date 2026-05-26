import type { Product } from '@/types'
import { UNIT_LABELS } from '@/types'
import { LuPencil, LuTrash2, LuPackage, LuBarcode, LuClock } from 'react-icons/lu'

interface Props {
  product: Product
  onConsume: (p: Product) => void
  onRestock: (p: Product) => void
  onDelete:  (id: string) => void
  onEdit:    (p: Product) => void
  /** Si se omite, se muestran todas las acciones (compat). */
  caps?: { edit: boolean; delete: boolean; adjust: boolean }
}

export default function ProductCard({ product, onConsume, onRestock, onDelete, onEdit, caps }: Props) {
  const canEdit = caps == null || caps.edit
  const canDelete = caps == null || caps.delete
  const canAdjust = caps == null || caps.adjust
  const pct = Math.min(100, (product.quantity / Math.max(product.minQuantity * 3, 0.001)) * 100)
  const barClass = product.lowStock ? 'bg-red-400' : pct < 50 ? 'bg-amber-400' : 'bg-brand-400'
  const qty = product.quantity % 1 === 0 ? product.quantity : product.quantity.toFixed(1)

  return (
    <div className={[
      'card p-5 transition-all hover:shadow-lg',
      product.lowStock ? 'border-l-4 border-l-red-500' : '',
    ].join(' ')}>

      {/* header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1 min-w-0 pr-2">
          <div className="flex items-start gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center shrink-0">
              <LuPackage className="w-4 h-4 text-brand-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{product.name}</p>
              {product.sku && (
                <div className="flex items-center gap-1 mt-0.5">
                  <LuBarcode className="w-3 h-3 text-slate-400" />
                  <p className="text-xs text-slate-500">{product.sku}</p>
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {product.category && (
              <span className="badge bg-slate-100 text-slate-600">{product.category}</span>
            )}
            {product.lowStock && (
              <span className="badge bg-red-100 text-red-700 border border-red-200">Stock bajo</span>
            )}
            {product.expiringSoon && (
              <span className="badge bg-amber-100 text-amber-700 border border-amber-200">
                <LuClock className="w-3 h-3 mr-1" />
                Vence pronto
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-1 shrink-0">
          {canEdit && (
            <button
              type="button"
              onClick={() => onEdit(product)}
              className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-all"
            >
              <LuPencil className="w-4 h-4" />
            </button>
          )}
          {canDelete && (
            <button
              type="button"
              onClick={() => onDelete(product.id)}
              className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
            >
              <LuTrash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* quantity */}
      <div className="flex items-baseline gap-2 mb-3">
        <span className="text-4xl font-bold text-gray-900 tabular-nums">{qty}</span>
        <span className="text-sm font-medium text-slate-500">{UNIT_LABELS[product.unit as keyof typeof UNIT_LABELS] ?? product.unit}</span>
        {product.daysUntilEmpty != null && (
          <span className="ml-auto text-xs text-slate-400 tabular-nums flex items-center gap-1">
            <LuClock className="w-3 h-3" />
            ~{Math.round(product.daysUntilEmpty)} días
          </span>
        )}
      </div>

      {/* progress bar */}
      <div className="h-2 rounded-full bg-gray-100 mb-4 overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${barClass}`} style={{ width: `${pct}%` }} />
      </div>

      {/* actions */}
      {canAdjust && (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onConsume(product)}
            className="flex-1 py-2 text-xs font-semibold border border-gray-300 rounded-lg text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
          >− Consumir</button>
          <button
            type="button"
            onClick={() => onRestock(product)}
            className="flex-1 py-2 text-xs font-semibold border border-brand-300 bg-brand-50 rounded-lg text-brand-700 hover:bg-brand-100 transition-all shadow-sm"
          >+ Reponer</button>
        </div>
      )}
    </div>
  )
}
