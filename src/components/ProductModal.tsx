import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Product, CreateProductRequest, UnitType } from '@/types'
import { UNIT_OPTIONS } from '@/types'
import { useCreateProduct, useUpdateProduct } from '@/hooks/useProducts'
import { categoryService } from '@/services/api'
import { LuX, LuSave, LuPackage, LuBarcode, LuTag, LuCalendar, LuPlus } from 'react-icons/lu'

interface Props {
  product?: Product
  onClose: () => void
}

type FormState = {
  sku: string
  name: string
  quantity: string
  minQuantity: string
  unit: UnitType
  consumptionPerUse: string
  category: string
  expiryDate: string
  barcode: string
}

export default function ProductModal({ product, onClose }: Props) {
  const queryClient = useQueryClient()
  const create = useCreateProduct()
  const update = useUpdateProduct()

  const [form, setForm] = useState<FormState>({
    sku:              product?.sku ?? '',
    name:             product?.name ?? '',
    quantity:         String(product?.quantity ?? 1),
    minQuantity:      String(product?.minQuantity ?? 1),
    unit:             (product?.unit as UnitType) ?? 'UNIT',
    consumptionPerUse: String(product?.consumptionPerUse ?? 1),
    category:         product?.category ?? '',
    expiryDate:       product?.expiryDate ?? '',
    barcode:          product?.barcode ?? '',
  })

  const [showNewCategory, setShowNewCategory] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.list(),
  })

  const createCategory = useMutation({
    mutationFn: categoryService.create,
    onSuccess: (newCat) => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      setForm(f => ({ ...f, category: newCat.name }))
      setNewCategoryName('')
      setShowNewCategory(false)
    },
  })

  const set = (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [key]: e.target.value }))

  const handleCreateCategory = () => {
    if (!newCategoryName.trim()) return
    createCategory.mutate({ name: newCategoryName.trim() })
  }

  const busy = create.isPending || update.isPending

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const body: CreateProductRequest = {
      sku:              form.sku.trim(),
      name:             form.name,
      quantity:         parseFloat(form.quantity),
      minQuantity:      parseFloat(form.minQuantity),
      unit:             form.unit,
      consumptionPerUse: parseFloat(form.consumptionPerUse),
      category:         form.category || null,
      expiryDate:       form.expiryDate || null,
      barcode:          form.barcode || null,
    }
    if (product) {
      await update.mutateAsync({ id: product.id, data: body })
    } else {
      await create.mutateAsync(body)
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-lg card p-0 max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-brand-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-brand-100 flex items-center justify-center">
              <LuPackage className="w-5 h-5 text-brand-600" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">
              {product ? 'Editar producto' : 'Agregar producto'}
            </h2>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
          >
            <LuX className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto px-6 py-5">
          <div className="form-section">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <LuTag className="w-4 h-4" />
              Información básica
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">SKU *</label>
                <div className="relative">
                  <LuBarcode className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    className="input pl-10" 
                    placeholder="Ej: LEC-001" 
                    value={form.sku} 
                    onChange={set('sku')} 
                    required 
                    disabled={!!product} 
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">Nombre del producto *</label>
                <input 
                  className="input" 
                  placeholder="Ej: Leche entera 1L" 
                  value={form.name} 
                  onChange={set('name')} 
                  required 
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">Código de barras</label>
                <input 
                  className="input" 
                  placeholder="Ej: 7501234567890" 
                  value={form.barcode} 
                  onChange={set('barcode')} 
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Stock y medidas</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1.5">Cantidad actual</label>
                  <input 
                    className="input" 
                    type="number" 
                    min="0" 
                    step="0.1" 
                    value={form.quantity} 
                    onChange={set('quantity')} 
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1.5">Stock mínimo</label>
                  <input 
                    className="input" 
                    type="number" 
                    min="0" 
                    step="0.1" 
                    value={form.minQuantity} 
                    onChange={set('minQuantity')} 
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1.5">Unidad</label>
                  <select className="input" value={form.unit} onChange={set('unit')}>
                    {UNIT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1.5">Consumo por uso</label>
                  <input 
                    className="input" 
                    type="number" 
                    min="0.01" 
                    step="0.01" 
                    value={form.consumptionPerUse} 
                    onChange={set('consumptionPerUse')} 
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Categorización</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">Categoría</label>
                {showNewCategory ? (
                  <div className="flex gap-2">
                    <input
                      className="input flex-1"
                      placeholder="Ej: Ferretería, Farmacia, Bodega..."
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleCreateCategory())}
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={handleCreateCategory}
                      disabled={!newCategoryName.trim() || createCategory.isPending}
                      className="px-3 py-2 bg-accent-600 text-white text-sm font-semibold rounded-lg hover:bg-accent-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <LuSave className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowNewCategory(false)
                        setNewCategoryName('')
                      }}
                      className="px-3 py-2 bg-gray-200 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      <LuX className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <select className="input flex-1" value={form.category} onChange={set('category')}>
                      <option value="">Sin categoría</option>
                      {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                    <button
                      type="button"
                      onClick={() => setShowNewCategory(true)}
                      className="px-3 py-2 bg-brand-100 text-brand-700 text-sm font-semibold rounded-lg hover:bg-brand-200 transition-colors flex items-center gap-1.5"
                      title="Crear nueva categoría"
                    >
                      <LuPlus className="w-4 h-4" />
                      Nueva
                    </button>
                  </div>
                )}
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5 flex items-center gap-1.5">
                  <LuCalendar className="w-3.5 h-3.5" />
                  Fecha de vencimiento (opcional)
                </label>
                <input 
                  className="input" 
                  type="date" 
                  value={form.expiryDate} 
                  onChange={set('expiryDate')} 
                />
              </div>
            </div>
          </div>
        </form>

        <div className="flex gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">
            <LuX className="w-4 h-4" />
            Cancelar
          </button>
          <button type="submit" disabled={busy} className="btn-primary flex-1" onClick={handleSubmit}>
            <LuSave className="w-4 h-4" />
            {busy ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  )
}
