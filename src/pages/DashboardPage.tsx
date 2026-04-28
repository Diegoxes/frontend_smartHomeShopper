import { useState } from 'react'
import { useDashboard } from '@/hooks/useDashboard'
import { useDeleteProduct } from '@/hooks/useProducts'
import StatCard     from '@/components/StatCard'
import ProductGrid  from '@/components/ProductGrid'
import ProductModal from '@/components/ProductModal'
import AdjustModal  from '@/components/AdjustModal'
import type { ModalState } from '@/types'

export default function DashboardPage() {
  const { data, isLoading } = useDashboard()
  const deleteProduct       = useDeleteProduct()
  const [modal, setModal]   = useState<ModalState>(null)

  const handleDelete = (id: string) => {
    if (!confirm('¿Eliminar este producto?')) return
    deleteProduct.mutate(id)
  }

  if (isLoading) return <p className="text-sm text-gray-400 pt-4">Cargando...</p>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard 👋</h1>
          <p className="text-sm text-gray-400 mt-0.5">Resumen de tu inventario del hogar</p>
        </div>
        <button onClick={() => setModal({ type: 'form' })} className="btn-primary">
          + Agregar producto
        </button>
      </div>

      {/* stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard label="Total productos"  value={data?.totalProducts ?? 0} icon="📦" />
        <StatCard label="Stock bajo"       value={data?.lowStockCount ?? 0}  icon="⚠️" color="text-red-500" />
        <StatCard label="Por vencer"       value={data?.expiringCount ?? 0}  icon="📅" color="text-amber-500" />
      </div>

      {/* low stock */}
      {(data?.lowStockProducts?.length ?? 0) > 0 && (
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-red-500 mb-3">⚠ Stock bajo</h2>
          <ProductGrid products={data!.lowStockProducts} setModal={setModal} onDelete={handleDelete} />
        </section>
      )}

      {/* expiring */}
      {(data?.expiringProducts?.length ?? 0) > 0 && (
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-amber-500 mb-3">📅 Por vencer esta semana</h2>
          <ProductGrid products={data!.expiringProducts} setModal={setModal} onDelete={handleDelete} />
        </section>
      )}

      {!data?.lowStockProducts?.length && !data?.expiringProducts?.length && (
        <div className="text-center py-16 text-gray-300 text-sm">
          Todo en orden — sin alertas activas ✅
        </div>
      )}

      {modal?.type === 'form' && <ProductModal product={modal.data} onClose={() => setModal(null)} />}
      {(modal?.type === 'consume' || modal?.type === 'restock') && (
        <AdjustModal product={modal.data} mode={modal.type} onClose={() => setModal(null)} />
      )}
    </div>
  )
}
