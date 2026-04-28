import { useState } from 'react'
import { useDashboard } from '@/hooks/useDashboard'
import { useDeleteProduct } from '@/hooks/useProducts'
import ProductGrid  from '@/components/ProductGrid'
import ProductModal from '@/components/ProductModal'
import AdjustModal  from '@/components/AdjustModal'
import type { ModalState } from '@/types'

export default function AlertsPage() {
  const { data, isLoading } = useDashboard()
  const deleteProduct       = useDeleteProduct()
  const [modal, setModal]   = useState<ModalState>(null)

  const handleDelete = (id: string) => {
    if (!confirm('¿Eliminar este producto?')) return
    deleteProduct.mutate(id)
  }

  if (isLoading) return <p className="text-sm text-gray-400 pt-4">Cargando...</p>

  const noAlerts = !data?.lowStockProducts?.length && !data?.expiringProducts?.length

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Alertas ⚠️</h1>

      {noAlerts && (
        <div className="text-center py-20 text-gray-300 text-sm">
          <p className="text-4xl mb-3">✅</p>
          <p>Todo bien — sin alertas activas</p>
        </div>
      )}

      {(data?.lowStockProducts?.length ?? 0) > 0 && (
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-red-500 mb-3">
            📦 Stock bajo ({data!.lowStockProducts.length})
          </h2>
          <ProductGrid products={data!.lowStockProducts} setModal={setModal} onDelete={handleDelete} />
        </section>
      )}

      {(data?.expiringProducts?.length ?? 0) > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-amber-500 mb-3">
            📅 Por vencer ({data!.expiringProducts.length})
          </h2>
          <ProductGrid products={data!.expiringProducts} setModal={setModal} onDelete={handleDelete} />
        </section>
      )}

      {modal?.type === 'form' && <ProductModal product={modal.data} onClose={() => setModal(null)} />}
      {(modal?.type === 'consume' || modal?.type === 'restock') && (
        <AdjustModal product={modal.data} mode={modal.type} onClose={() => setModal(null)} />
      )}
    </div>
  )
}
