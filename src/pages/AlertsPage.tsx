/** Vista dedicada a alertas; consume los mismos datos que Dashboard (useDashboard) */
import { useState } from 'react'
import { useDashboard } from '@/hooks/useDashboard'
import { useDeleteProduct } from '@/hooks/useProducts'
import { useAuth } from '@/context/AuthContext'
import ProductGrid  from '@/components/ProductGrid'
import ProductModal from '@/components/ProductModal'
import AdjustModal  from '@/components/AdjustModal'
import { MOD, modulePerm } from '@/lib/permissions'
import type { ModalState } from '@/types'
import { LuBell, LuCalendar, LuCheck, LuPackage } from 'react-icons/lu'

export default function AlertsPage() {
  const { user } = useAuth()
  const inv = modulePerm(user, MOD.INVENTORY)
  const gridCaps = { edit: inv.canUpdate, delete: inv.canDelete, adjust: inv.canUpdate }
  const { data, isLoading } = useDashboard()
  const deleteProduct       = useDeleteProduct()
  const [modal, setModal]   = useState<ModalState>(null)

  const handleDelete = (id: string) => {
    if (!confirm('¿Eliminar este producto?')) return
    deleteProduct.mutate(id)
  }

  if (isLoading) return (
    <div className="flex items-center justify-center py-20">
      <div className="text-center">
        <div className="w-12 h-12 rounded-full border-4 border-brand-200 border-t-brand-600 animate-spin mx-auto mb-4" />
        <p className="text-sm text-slate-500">Cargando alertas...</p>
      </div>
    </div>
  )

  const noAlerts = !data?.lowStockProducts?.length && !data?.expiringProducts?.length
  const totalAlerts = (data?.lowStockProducts?.length ?? 0) + (data?.expiringProducts?.length ?? 0)

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <LuBell className="w-8 h-8 text-orange-500" />
          Alertas
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          {noAlerts 
            ? 'No hay alertas activas en este momento' 
            : `${totalAlerts} ${totalAlerts === 1 ? 'alerta activa' : 'alertas activas'}`
          }
        </p>
      </div>

      {noAlerts && (
        <div className="text-center py-20 bg-accent-50 rounded-xl border border-accent-200">
          <div className="w-20 h-20 rounded-full bg-accent-100 flex items-center justify-center mx-auto mb-5">
            <LuCheck className="w-10 h-10 text-accent-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Todo en orden</h2>
          <p className="text-slate-600">No hay alertas activas de stock o vencimientos</p>
          <p className="text-sm text-slate-500 mt-2">
            Te notificaremos cuando haya productos con stock bajo o próximos a vencer
          </p>
        </div>
      )}

      {(data?.lowStockProducts?.length ?? 0) > 0 && (
        <section className="mb-10">
          <div className="card p-5 mb-4 bg-red-50 border-red-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
                <LuPackage className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold text-red-700">Stock bajo</h2>
                <p className="text-sm text-red-600">
                  {data!.lowStockProducts.length} {data!.lowStockProducts.length === 1 ? 'producto' : 'productos'} por debajo del stock mínimo
                </p>
              </div>
              <div className="text-3xl font-bold text-red-600 tabular-nums">
                {data!.lowStockProducts.length}
              </div>
            </div>
          </div>
          <ProductGrid products={data!.lowStockProducts} setModal={setModal} onDelete={handleDelete} caps={gridCaps} />
        </section>
      )}

      {(data?.expiringProducts?.length ?? 0) > 0 && (
        <section>
          <div className="card p-5 mb-4 bg-amber-50 border-amber-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                <LuCalendar className="w-6 h-6 text-amber-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold text-amber-700">Por vencer pronto</h2>
                <p className="text-sm text-amber-600">
                  {data!.expiringProducts.length} {data!.expiringProducts.length === 1 ? 'producto' : 'productos'} próximos a su fecha de vencimiento
                </p>
              </div>
              <div className="text-3xl font-bold text-amber-600 tabular-nums">
                {data!.expiringProducts.length}
              </div>
            </div>
          </div>
          <ProductGrid products={data!.expiringProducts} setModal={setModal} onDelete={handleDelete} caps={gridCaps} />
        </section>
      )}

      {modal?.type === 'form' && <ProductModal product={modal.data} onClose={() => setModal(null)} />}
      {(modal?.type === 'consume' || modal?.type === 'restock') && (
        <AdjustModal product={modal.data} mode={modal.type} onClose={() => setModal(null)} />
      )}
    </div>
  )
}
