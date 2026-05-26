import { useEffect, useState } from 'react'
import { purchaseService } from '@/services/api'
import type { PurchasesPage } from '@/types'
import { LuShoppingCart, LuCalendar, LuPackage, LuStore, LuDollarSign } from 'react-icons/lu'

export default function PurchasesPage() {
  const [data, setData] = useState<PurchasesPage | null>(null)

  useEffect(() => {
    purchaseService.list().then(setData).catch(() => setData({ items: [], periodTotalSpend: 0 }))
  }, [])

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <LuShoppingCart className="w-8 h-8 text-brand-500" />
          Compras
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Historial de compras y reposiciones de inventario
        </p>
      </div>

      <div className="card p-6 mb-8 bg-gradient-to-r from-brand-50 to-white border-brand-200">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-brand-100 flex items-center justify-center shrink-0">
            <LuDollarSign className="w-7 h-7 text-brand-600" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">Gasto del periodo</p>
            <p className="text-3xl font-bold text-brand-700 tabular-nums">
              ${data?.periodTotalSpend?.toFixed(2) ?? '0.00'}
            </p>
          </div>
        </div>
      </div>

      {data?.items && data.items.length > 0 ? (
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
                      day: 'numeric' 
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
          <p className="text-sm text-slate-500 mt-1">
            Las compras se registran automáticamente al reponer stock
          </p>
        </div>
      )}
    </div>
  )
}
