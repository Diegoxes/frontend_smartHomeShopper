/** Historial de compras + registro de entradas de mercancía con costo */
import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { purchaseService, productService } from '@/services/api'
import { PURCHASES_KEY } from '@/hooks/useProducts'
import type { Product } from '@/types'
import AdjustModal from '@/components/AdjustModal'
import { LuShoppingCart, LuCalendar, LuPackage, LuStore, LuDollarSign, LuPlus } from 'react-icons/lu'

export default function PurchasesPage() {
  const queryClient = useQueryClient()
  const [restockProduct, setRestockProduct] = useState<Product | null>(null)
  const [pickProductId, setPickProductId] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: PURCHASES_KEY,
    queryFn: () => purchaseService.list(),
  })

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => productService.getAll(),
  })

  const handleRegisterPurchase = () => {
    const product = products.find(p => p.id === pickProductId)
    if (product) setRestockProduct(product)
  }

  return (
    <div>
      <div className="mb-8 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <LuShoppingCart className="w-8 h-8 text-brand-500" />
            Compras
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-xl">
            Gasto registrado al crear productos con costo o al hacer entradas de mercancía con precio.
            Sin precio, el stock sube pero no aparece aquí.
          </p>
        </div>
      </div>

      <div className="card p-6 mb-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <LuPlus className="w-4 h-4 text-brand-600" />
          Registrar compra
        </h2>
        <p className="text-xs text-slate-500 mb-4">
          Selecciona un producto, indica cantidad, precio y proveedor. Suma stock e historial de gasto en un solo paso.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            className="input flex-1"
            value={pickProductId}
            onChange={e => setPickProductId(e.target.value)}
          >
            <option value="">Elegir producto...</option>
            {products.map(p => (
              <option key={p.id} value={p.id}>{p.name} ({p.quantity} en stock)</option>
            ))}
          </select>
          <button
            type="button"
            className="btn-primary shrink-0"
            disabled={!pickProductId}
            onClick={handleRegisterPurchase}
          >
            <LuPlus className="w-4 h-4" />
            Continuar
          </button>
        </div>
      </div>

      <div className="card p-6 mb-8 bg-gradient-to-r from-brand-50 to-white border-brand-200">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-brand-100 flex items-center justify-center shrink-0">
            <LuDollarSign className="w-7 h-7 text-brand-600" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">Gasto del periodo (30 días)</p>
            <p className="text-3xl font-bold text-brand-700 tabular-nums">
              ${data?.periodTotalSpend?.toFixed(2) ?? '0.00'}
            </p>
          </div>
        </div>
      </div>

      {isLoading ? (
        <p className="text-sm text-slate-500 text-center py-12">Cargando compras...</p>
      ) : data?.items && data.items.length > 0 ? (
        <div className="card overflow-hidden">
          <table className="table-modern">
            <thead>
              <tr>
                <th>
                  <div className="flex items-center gap-2">
                    <LuCalendar className="w-3.5 h-3.5" />
                    Fecha
                  </div>
                </th>
                <th>
                  <div className="flex items-center gap-2">
                    <LuPackage className="w-3.5 h-3.5" />
                    Producto
                  </div>
                </th>
                <th>
                  <div className="flex items-center gap-2">
                    <LuStore className="w-3.5 h-3.5" />
                    Proveedor
                  </div>
                </th>
                <th>Cantidad</th>
                <th>
                  <div className="flex items-center gap-2">
                    <LuDollarSign className="w-3.5 h-3.5" />
                    Total
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {data.items.map(p => (
                <tr key={p.id}>
                  <td className="font-medium text-slate-700">
                    {new Date(p.purchasedAt).toLocaleDateString('es-MX', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </td>
                  <td className="font-medium text-gray-900">{p.productName}</td>
                  <td className="text-slate-600">{p.supplierName ?? '—'}</td>
                  <td className="font-semibold tabular-nums">{p.quantity}</td>
                  <td className="font-bold text-brand-700 tabular-nums">
                    ${p.totalAmount?.toFixed(2) ?? '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-20 bg-slate-50 rounded-xl border border-slate-200">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <LuShoppingCart className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-slate-600 font-medium">No hay compras registradas</p>
          <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
            Al agregar un producto, pon <strong>costo unitario</strong> y cantidad.
            Al reponer stock, incluye el <strong>precio de compra</strong>.
            Sin precio no se registra gasto.
          </p>
        </div>
      )}

      {restockProduct && (
        <AdjustModal
          product={restockProduct}
          mode="restock"
          onClose={() => {
            setRestockProduct(null)
            queryClient.invalidateQueries({ queryKey: PURCHASES_KEY })
          }}
        />
      )}
    </div>
  )
}
