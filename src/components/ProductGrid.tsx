import type { Product, ModalState } from '@/types'
import ProductCard from './ProductCard'

interface Props {
  products: Product[]
  setModal: (m: ModalState) => void
  onDelete: (id: string) => void
}

export default function ProductGrid({ products, setModal, onDelete }: Props) {
  if (!products.length) return null
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {products.map(p => (
        <ProductCard
          key={p.id}
          product={p}
          onConsume={p => setModal({ type: 'consume', data: p })}
          onRestock={p => setModal({ type: 'restock', data: p })}
          onDelete={onDelete}
          onEdit={p   => setModal({ type: 'form', data: p })}
        />
      ))}
    </div>
  )
}
