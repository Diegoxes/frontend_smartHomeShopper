/** Modal crear/editar producto. SKU bloqueado en edición (identificador inmutable). */
import { useEffect, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Product, CreateProductRequest, UnitType, Supplier, MeasureUnit } from '@/types'
import { unitSelectOptions } from '@/types'
import { useCreateProduct, useUpdateProduct } from '@/hooks/useProducts'
import { categoryService, supplierService, measureUnitService, productService } from '@/services/api'
import { LuX, LuSave, LuPackage, LuBarcode, LuTag, LuCalendar, LuPlus, LuDollarSign, LuStore } from 'react-icons/lu'

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
  unitsPerPurchaseUnit: string
  category: string
  expiryDate: string
  barcode: string
  unitCost: string
  salePrice: string
  supplierId: string
}

function optionalPrice(value: string): number | null {
  const trimmed = value.trim()
  if (!trimmed) return null
  const n = parseFloat(trimmed)
  return Number.isFinite(n) ? n : null
}

function optionalUnitsPerBox(value: string): number | null {
  const trimmed = value.trim()
  if (!trimmed) return null
  const n = parseInt(trimmed, 10)
  return Number.isFinite(n) && n > 1 ? n : null
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
    unitsPerPurchaseUnit: product?.unitsPerPurchaseUnit != null && product.unitsPerPurchaseUnit > 1
      ? String(product.unitsPerPurchaseUnit) : '',
    category:         product?.category ?? '',
    expiryDate:       product?.expiryDate ?? '',
    barcode:          product?.barcode ?? '',
    unitCost:         product?.avgCost != null ? String(product.avgCost)
                      : product?.lastCost != null ? String(product.lastCost) : '',
    salePrice:        product?.salePrice != null ? String(product.salePrice) : '',
    supplierId:       '',
  })

  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [measureUnits, setMeasureUnits] = useState<MeasureUnit[]>([])
  const [boxUnitId, setBoxUnitId] = useState('')

  useEffect(() => {
    measureUnitService.list().then(units => {
      setMeasureUnits(units)
      const box = units.find(u => u.code === 'BOX')
      if (box) setBoxUnitId(prev => prev || box.id)
    }).catch(() => {})
    if (!product) supplierService.list().then(setSuppliers).catch(() => {})
    if (product?.productUoms?.length) {
      const box = product.productUoms.find(u => u.code === 'BOX') ?? product.productUoms[0]
      if (box) {
        setBoxUnitId(box.measureUnitId)
        setForm(f => ({ ...f, unitsPerPurchaseUnit: String(box.factorToBase) }))
      }
    }
  }, [product])

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
    const boxFactor = optionalUnitsPerBox(form.unitsPerPurchaseUnit)
    const productUoms = boxFactor && boxUnitId
      ? [{ measureUnitId: boxUnitId, factorToBase: boxFactor }]
      : undefined
    const body: CreateProductRequest = {
      sku:              form.sku.trim(),
      name:             form.name,
      quantity:         parseFloat(form.quantity),
      minQuantity:      parseFloat(form.minQuantity),
      unit:             form.unit,
      consumptionPerUse: 1,
      unitsPerPurchaseUnit: boxFactor,
      productUoms,
      category:         form.category || null,
      expiryDate:       form.expiryDate || null,
      barcode:          form.barcode || null,
      unitCost:         optionalPrice(form.unitCost),
      salePrice:        optionalPrice(form.salePrice),
      supplierId:       !product && form.supplierId ? form.supplierId : undefined,
    }
    if (product) {
      await update.mutateAsync({ id: product.id, data: body })
      if (productUoms) await productService.replaceUoms(product.id, productUoms)
      else await productService.replaceUoms(product.id, [])
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
                  <label className="text-xs font-semibold text-slate-600 block mb-1.5">Unidad de inventario</label>
                  <select className="input" value={form.unit} onChange={set('unit')}>
                    {unitSelectOptions(form.unit).map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                  <p className="text-xs text-slate-500 mt-1">
                    Casi siempre elige <strong>Unidades</strong>. Compras en cajas con el campo de abajo.
                  </p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1.5">Presentación de compra</label>
                  <select className="input mb-2" value={boxUnitId} onChange={e => setBoxUnitId(e.target.value)}>
                    <option value="">Sin caja/pack</option>
                    {measureUnits.filter(m => !m.baseUnit).map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                  {boxUnitId && (
                    <>
                      <input
                        className="input"
                        type="number"
                        min="2"
                        step="1"
                        placeholder="Unidades por caja (ej. 24)"
                        value={form.unitsPerPurchaseUnit}
                        onChange={set('unitsPerPurchaseUnit')}
                      />
                      <p className="text-xs text-slate-500 mt-1">
                        1 {measureUnits.find(m => m.id === boxUnitId)?.name?.toLowerCase() ?? 'caja'} = N unidades en stock.
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <LuDollarSign className="w-4 h-4" />
              Precios
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">Costo unitario</label>
                <input
                  className="input"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Ej: 3.00"
                  value={form.unitCost}
                  onChange={set('unitCost')}
                />
                <p className="text-xs text-slate-500 mt-1">
                  Lo que pagas al proveedor. Con costo y cantidad, aparece en Compras.
                </p>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">Precio de venta</label>
                <input
                  className="input"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Ej: 5.00"
                  value={form.salePrice}
                  onChange={set('salePrice')}
                />
                <p className="text-xs text-slate-500 mt-1">Lo que cobras al cliente</p>
              </div>
            </div>
            {!product && parseFloat(form.quantity) > 0 && (
              <div className="mt-4">
                <label className="text-xs font-semibold text-slate-600 block mb-1.5 flex items-center gap-1.5">
                  <LuStore className="w-3.5 h-3.5" />
                  Proveedor (opcional)
                </label>
                <select className="input" value={form.supplierId} onChange={set('supplierId')}>
                  <option value="">Sin proveedor</option>
                  {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                <p className="text-xs text-slate-500 mt-1">
                  De quién compraste este stock inicial. Puedes agregar proveedores en el menú Proveedores.
                </p>
              </div>
            )}
          </div>

          <div className="form-section">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Clasificación del producto</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">Categoría del producto</label>
                <p className="text-xs text-slate-500 mb-2">
                  Agrupa este ítem en tu catálogo (ej. Lácteos, Herramientas). No es el rubro de tu negocio.
                </p>
                {showNewCategory ? (
                  <div className="flex gap-2">
                    <input
                      className="input flex-1"
                      placeholder="Ej: Lácteos, Electricidad, Medicamentos..."
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
                      title="Crear categoría de producto"
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
