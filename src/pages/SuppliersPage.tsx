import { useEffect, useState } from 'react'
import { supplierService } from '@/services/api'
import type { Supplier } from '@/types'
import toast from 'react-hot-toast'
import { LuStore, LuPlus, LuPhone, LuMail, LuMapPin } from 'react-icons/lu'

export default function SuppliersPage() {
  const [items, setItems] = useState<Supplier[]>([])
  const [name, setName] = useState('')

  const load = () => supplierService.list().then(setItems).catch(() => toast.error('Error cargando proveedores'))

  useEffect(() => { load() }, [])

  const create = async (e: React.FormEvent) => {
    e.preventDefault()
    await supplierService.create({ name })
    setName('')
    load()
    toast.success('Proveedor creado')
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <LuStore className="w-8 h-8 text-brand-500" />
          Proveedores
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          {items.length} {items.length === 1 ? 'proveedor registrado' : 'proveedores registrados'}
        </p>
      </div>

      <form onSubmit={create} className="card p-6 mb-8">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">Agregar nuevo proveedor</h2>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <LuStore className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              className="input pl-10 w-full" 
              placeholder="Nombre del proveedor" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              required 
            />
          </div>
          <button type="submit" className="btn-primary">
            <LuPlus className="w-4 h-4" />
            Agregar
          </button>
        </div>
      </form>

      {items.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map(s => (
            <div key={s.id} className="card p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-brand-50 flex items-center justify-center shrink-0">
                  <LuStore className="w-6 h-6 text-brand-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 truncate mb-2">{s.name}</h3>
                  <div className="space-y-1">
                    {s.phone && (
                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        <LuPhone className="w-3.5 h-3.5 text-slate-400" />
                        {s.phone}
                      </div>
                    )}
                    {!s.phone && (
                      <p className="text-xs text-slate-400 italic">Sin información de contacto</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-slate-50 rounded-xl border border-slate-200">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <LuStore className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-slate-600 font-medium">No hay proveedores registrados</p>
          <p className="text-sm text-slate-500 mt-1">
            Agrega tu primer proveedor usando el formulario arriba
          </p>
        </div>
      )}
    </div>
  )
}
