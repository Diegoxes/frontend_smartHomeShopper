import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useDashboard } from '@/hooks/useDashboard'
import { useDeleteProduct } from '@/hooks/useProducts'
import { useAuth } from '@/context/AuthContext'
import { dashboardService } from '@/services/api'
import StatCard from '@/components/StatCard'
import ProductGrid from '@/components/ProductGrid'
import ProductModal from '@/components/ProductModal'
import AdjustModal from '@/components/AdjustModal'
import { MOD, modulePerm } from '@/lib/permissions'
import type { ModalState } from '@/types'
import { 
  LuPackage, 
  LuBell, 
  LuCalendar, 
  LuDollarSign, 
  LuShoppingCart, 
  LuPause,
  LuPlus 
} from 'react-icons/lu'

export default function DashboardPage() {
  const { user } = useAuth()
  const inv = modulePerm(user, MOD.INVENTORY)
  const { data, isLoading } = useDashboard()
  const { data: exec } = useQuery({ queryKey: ['executive'], queryFn: () => dashboardService.executive() })
  const deleteProduct = useDeleteProduct()
  const [modal, setModal] = useState<ModalState>(null)
  const gridCaps = { edit: inv.canUpdate, delete: inv.canDelete, adjust: inv.canUpdate }

  const handleDelete = (id: string) => {
    if (!confirm('¿Eliminar este producto?')) return
    deleteProduct.mutate(id)
  }

  if (isLoading) return (
    <div className="flex items-center justify-center py-20">
      <div className="text-center">
        <div className="w-12 h-12 rounded-full border-4 border-brand-200 border-t-brand-600 animate-spin mx-auto mb-4" />
        <p className="text-sm text-slate-500">Cargando dashboard...</p>
      </div>
    </div>
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-slate-600 mt-1">Resumen operativo de tu negocio en tiempo real</p>
        </div>
        {inv.canCreate && (
          <button type="button" onClick={() => setModal({ type: 'form' })} className="btn-primary">
            <LuPlus className="w-5 h-5" />
            Agregar producto
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          label="Total productos" 
          value={data?.totalProducts ?? 0} 
          icon={LuPackage}
          bgGradient="from-blue-50 to-blue-100"
        />
        <StatCard 
          label="Stock bajo" 
          value={data?.lowStockCount ?? 0} 
          icon={LuBell} 
          color="text-red-600"
          bgGradient="from-red-50 to-red-100"
        />
        <StatCard 
          label="Por vencer" 
          value={data?.expiringCount ?? 0} 
          icon={LuCalendar} 
          color="text-amber-600"
          bgGradient="from-amber-50 to-amber-100"
        />
        <StatCard 
          label="Valor stock" 
          value={`$${exec?.totalStockValue?.toFixed(0) ?? 0}`} 
          icon={LuDollarSign}
          bgGradient="from-accent-50 to-accent-100"
          color="text-accent-700"
        />
      </div>

      {exec && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          <StatCard 
            label="Compras del mes" 
            value={`$${exec.monthPurchaseSpend?.toFixed(0) ?? 0}`} 
            icon={LuShoppingCart}
            bgGradient="from-brand-50 to-brand-100"
            color="text-brand-700"
          />
          <StatCard 
            label="Productos sin movimiento" 
            value={exec.stagnantProductIds?.length ?? 0} 
            icon={LuPause}
            bgGradient="from-slate-50 to-slate-100"
            color="text-slate-700"
          />
        </div>
      )}

      {(data?.lowStockProducts?.length ?? 0) > 0 && (
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <LuBell className="w-5 h-5 text-red-500" />
            <h2 className="text-lg font-bold text-red-600">Productos con stock bajo</h2>
          </div>
          <ProductGrid products={data!.lowStockProducts} setModal={setModal} onDelete={handleDelete} caps={gridCaps} />
        </section>
      )}

      {(data?.expiringProducts?.length ?? 0) > 0 && (
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <LuCalendar className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-bold text-amber-600">Productos por vencer pronto</h2>
          </div>
          <ProductGrid products={data!.expiringProducts} setModal={setModal} onDelete={handleDelete} caps={gridCaps} />
        </section>
      )}

      {!data?.lowStockProducts?.length && !data?.expiringProducts?.length && (
        <div className="text-center py-20 bg-accent-50 rounded-xl border border-accent-200">
          <div className="w-16 h-16 rounded-full bg-accent-100 flex items-center justify-center mx-auto mb-4">
            <LuPackage className="w-8 h-8 text-accent-600" />
          </div>
          <p className="text-slate-600 font-medium">Todo en orden</p>
          <p className="text-sm text-slate-500 mt-1">No hay alertas activas en este momento</p>
        </div>
      )}

      {modal?.type === 'form' && <ProductModal product={modal.data} onClose={() => setModal(null)} />}
      {(modal?.type === 'consume' || modal?.type === 'restock') && (
        <AdjustModal product={modal.data} mode={modal.type} onClose={() => setModal(null)} />
      )}
    </div>
  )
}
