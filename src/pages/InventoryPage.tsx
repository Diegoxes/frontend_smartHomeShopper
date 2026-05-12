import { useState } from 'react'
import { useDashboard } from '@/hooks/useDashboard'
import { useDeleteProduct } from '@/hooks/useProducts'
import { useAuth } from '@/context/AuthContext'
import ProductGrid  from '@/components/ProductGrid'
import ProductModal from '@/components/ProductModal'
import AdjustModal  from '@/components/AdjustModal'
import { MOD, modulePerm } from '@/lib/permissions'
import type { ModalState } from '@/types'
import { CATEGORIES } from '@/types'

export default function InventoryPage() {
  const { user } = useAuth()
  const inv = modulePerm(user, MOD.INVENTORY)
  const gridCaps = { edit: inv.canUpdate, delete: inv.canDelete, adjust: inv.canUpdate }
  const { data, isLoading } = useDashboard()
  const deleteProduct       = useDeleteProduct()
  const [modal, setModal]   = useState<ModalState>(null)
  const [search, setSearch] = useState('')
  const [cat, setCat]       = useState('')

  const handleDelete = (id: string) => {
    if (!confirm('¿Eliminar este producto?')) return
    deleteProduct.mutate(id)
  }

  const products = data?.allProducts ?? []
  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase())
    const matchCat    = !cat || p.category === cat
    return matchSearch && matchCat
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Inventario 📦</h1>
        {inv.canCreate && (
          <button type="button" onClick={() => setModal({ type: 'form' })} className="btn-primary">
            + Agregar
          </button>
        )}
      </div>

      {/* filters */}
      <div className="flex gap-3 mb-6">
        <input
          className="input flex-1"
          placeholder="🔍  Buscar producto..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select
          className="input w-48 shrink-0"
          value={cat}
          onChange={e => setCat(e.target.value)}
        >
          <option value="">Todas las categorías</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {isLoading
        ? <p className="text-sm text-gray-400">Cargando...</p>
        : filtered.length === 0
          ? <div className="text-center py-20 text-gray-300 text-sm">
              {products.length === 0
                ? <><p className="text-4xl mb-3">📦</p><p>Agrega tu primer producto</p></>
                : <p>Sin resultados para "{search}"</p>
              }
            </div>
          : <ProductGrid products={filtered} setModal={setModal} onDelete={handleDelete} caps={gridCaps} />
      }

      {modal?.type === 'form' && <ProductModal product={modal.data} onClose={() => setModal(null)} />}
      {(modal?.type === 'consume' || modal?.type === 'restock') && (
        <AdjustModal product={modal.data} mode={modal.type} onClose={() => setModal(null)} />
      )}
    </div>
  )
}
