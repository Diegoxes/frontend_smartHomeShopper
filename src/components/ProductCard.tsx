import type { Product } from '@/types'
import { UNIT_LABELS } from '@/types'

interface Props {
  product: Product
  onConsume: (p: Product) => void
  onRestock: (p: Product) => void
  onDelete:  (id: string) => void
  onEdit:    (p: Product) => void
}

export default function ProductCard({ product, onConsume, onRestock, onDelete, onEdit }: Props) {
  const pct = Math.min(100, (product.quantity / Math.max(product.minQuantity * 3, 0.001)) * 100)
  const barClass = product.lowStock ? 'bg-red-400' : pct < 50 ? 'bg-amber-400' : 'bg-brand-400'
  const qty = product.quantity % 1 === 0 ? product.quantity : product.quantity.toFixed(1)

  return (
    <div className={[
      'bg-white rounded-xl p-4 border transition-shadow hover:shadow-md',
      product.lowStock ? 'border-red-200' : 'border-gray-100',
    ].join(' ')}>

      {/* header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1 min-w-0 pr-2">
          <p className="text-sm font-semibold text-gray-800 truncate">{product.name}</p>
          <div className="flex flex-wrap gap-1 mt-1">
            {product.category && (
              <span className="badge bg-gray-100 text-gray-500">{product.category}</span>
            )}
            {product.lowStock && (
              <span className="badge bg-red-50 text-red-500">Stock bajo</span>
            )}
            {product.expiringSoon && (
              <span className="badge bg-amber-50 text-amber-600">Vence pronto</span>
            )}
          </div>
        </div>
        <div className="flex gap-1 shrink-0">
          <button
            onClick={() => onEdit(product)}
            className="w-7 h-7 flex items-center justify-center text-gray-300 hover:text-gray-500 hover:bg-gray-50 rounded-lg transition-colors text-sm"
          >✏️</button>
          <button
            onClick={() => onDelete(product.id)}
            className="w-7 h-7 flex items-center justify-center text-gray-300 hover:text-red-400 hover:bg-red-50 rounded-lg transition-colors text-sm"
          >🗑</button>
        </div>
      </div>

      {/* quantity */}
      <div className="flex items-baseline gap-1 mb-2">
        <span className="text-3xl font-bold text-gray-800">{qty}</span>
        <span className="text-sm text-gray-400">{UNIT_LABELS[product.unit]}</span>
        {product.daysUntilEmpty != null && (
          <span className="ml-auto text-xs text-gray-300 tabular-nums">
            ~{Math.round(product.daysUntilEmpty)} días
          </span>
        )}
      </div>

      {/* progress bar */}
      <div className="h-1.5 rounded-full bg-gray-100 mb-4">
        <div className={`h-full rounded-full transition-all duration-500 ${barClass}`} style={{ width: `${pct}%` }} />
      </div>

      {/* actions */}
      <div className="flex gap-2">
        <button
          onClick={() => onConsume(product)}
          className="flex-1 py-1.5 text-xs font-medium border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors"
        >− Consumir</button>
        <button
          onClick={() => onRestock(product)}
          className="flex-1 py-1.5 text-xs font-medium border border-brand-200 bg-brand-50 rounded-lg text-brand-700 hover:bg-brand-100 transition-colors"
        >+ Reponer</button>
      </div>
    </div>
  )
}
