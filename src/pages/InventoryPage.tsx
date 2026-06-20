/**
 * Catálogo de productos con filtros server-side.
 * queryKey incluye filtros → React Query refetch automático al cambiar búsqueda/categoría.
 */
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { productService, categoryService } from '@/services/api'
import { useDeleteProduct } from '@/hooks/useProducts'
import { useAuth } from '@/context/AuthContext'
import ProductGrid from '@/components/ProductGrid'
import ProductModal from '@/components/ProductModal'
import AdjustModal from '@/components/AdjustModal'
import { MOD, modulePerm } from '@/lib/permissions'
import type { ModalState } from '@/types'
import { LuPlus, LuSearch, LuFilter, LuPackage, LuBell, LuCalendar } from 'react-icons/lu'

export default function InventoryPage() {
  const { user } = useAuth()
  const inv = modulePerm(user, MOD.INVENTORY)
  const gridCaps = { edit: inv.canUpdate, delete: inv.canDelete, adjust: inv.canUpdate }
  const deleteProduct = useDeleteProduct()
  // ModalState centraliza qué modal está abierto (form | consume | restock)
  const [modal, setModal] = useState<ModalState>(null)
  const [search, setSearch] = useState('')
  const [cat, setCat] = useState('')
  const [lowStock, setLowStock] = useState(false)
  const [expiringSoon, setExpiringSoon] = useState(false)

  const { data: products = [], isPending, isFetching } = useQuery({
    queryKey: ['products', search, cat, lowStock, expiringSoon],
    queryFn: () => productService.getAll({
      q: search || undefined,
      category: cat || undefined,
      lowStock: lowStock || undefined,
      expiringSoon: expiringSoon || undefined,
    }),
  })

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.list(),
  })

  const handleDelete = (id: string) => {
    if (!confirm('¿Eliminar este producto?')) return
    deleteProduct.mutate(id)
  }

  const hasFilters = !!(search || cat || lowStock || expiringSoon)
  const showLoading = isPending || (isFetching && products.length === 0)

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inventario</h1>
          <p className="text-sm text-slate-600 mt-1">
            {products.length} {products.length === 1 ? 'producto' : 'productos'} en total
          </p>
        </div>
        {inv.canCreate && (
          <button type="button" onClick={() => setModal({ type: 'form' })} className="btn-primary">
            <LuPlus className="w-5 h-5" />
            Agregar producto
          </button>
        )}
      </div>

      <div className="card p-6 mb-8">
        <div className="flex items-center gap-2 mb-4">
          <LuFilter className="w-5 h-5 text-slate-500" />
          <h3 className="text-sm font-semibold text-gray-900">Filtros</h3>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[250px]">
            <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              className="input pl-10 w-full" 
              placeholder="Buscar SKU, código de barras o nombre..." 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
            />
          </div>
          <select 
            className="input w-52 shrink-0" 
            value={cat} 
            onChange={e => setCat(e.target.value)}
          >
            <option value="">Todas las categorías</option>
            {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
          </select>
          <button 
            type="button" 
            className={lowStock ? 'btn-primary' : 'btn-secondary'} 
            onClick={() => setLowStock(v => !v)}
          >
            <LuBell className="w-4 h-4" />
            Stock bajo
          </button>
          <button 
            type="button" 
            className={expiringSoon ? 'btn-primary' : 'btn-secondary'} 
            onClick={() => setExpiringSoon(v => !v)}
          >
            <LuCalendar className="w-4 h-4" />
            Por vencer
          </button>
        </div>
      </div>

      {showLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full border-4 border-brand-200 border-t-brand-600 animate-spin mx-auto mb-4" />
            <p className="text-sm text-slate-500">Cargando productos...</p>
          </div>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 rounded-xl border border-slate-200">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <LuPackage className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-slate-600 font-medium">No se encontraron productos</p>
          <p className="text-sm text-slate-500 mt-1">
            {hasFilters
              ? 'Intenta ajustar los filtros'
              : 'Usa el botón Agregar producto arriba para comenzar'}
          </p>
        </div>
      ) : (
        <ProductGrid products={products} setModal={setModal} onDelete={handleDelete} caps={gridCaps} />
      )}

      {modal?.type === 'form' && <ProductModal product={modal.data} onClose={() => setModal(null)} />}
      {(modal?.type === 'consume' || modal?.type === 'restock') && (
        <AdjustModal product={modal.data} mode={modal.type} onClose={() => setModal(null)} />
      )}
    </div>
  )
}
