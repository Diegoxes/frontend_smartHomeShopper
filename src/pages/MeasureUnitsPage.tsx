/** Catálogo de unidades de medida por organización */
import { useEffect, useState } from 'react'
import { measureUnitService } from '@/services/api'
import type { MeasureUnit } from '@/types'
import toast from 'react-hot-toast'
import { LuRuler, LuPlus, LuTrash2 } from 'react-icons/lu'

export default function MeasureUnitsPage() {
  const [items, setItems] = useState<MeasureUnit[]>([])
  const [code, setCode] = useState('')
  const [name, setName] = useState('')

  const load = () => measureUnitService.list().then(setItems).catch(() => toast.error('Error cargando unidades'))

  useEffect(() => { load() }, [])

  const create = async (e: React.FormEvent) => {
    e.preventDefault()
    await measureUnitService.create({ code: code.trim().toUpperCase(), name: name.trim() })
    setCode('')
    setName('')
    load()
    toast.success('Unidad creada')
  }

  const deactivate = async (u: MeasureUnit) => {
    if (u.baseUnit) return
    await measureUnitService.delete(u.id)
    load()
    toast.success(u.active ? 'Unidad desactivada' : 'Unidad eliminada')
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <LuRuler className="w-8 h-8 text-brand-500" />
          Unidades de medida
        </h1>
        <p className="text-sm text-slate-600 mt-1 max-w-xl">
          Configura cómo compras (cajas, packs) mientras el stock interno siempre va en unidades.
        </p>
      </div>

      <form onSubmit={create} className="card p-6 mb-8">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">Agregar unidad</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input className="input" placeholder="Código (ej. BLISTER)" value={code} onChange={e => setCode(e.target.value)} required />
          <input className="input" placeholder="Nombre (ej. Blíster)" value={name} onChange={e => setName(e.target.value)} required />
          <button type="submit" className="btn-primary">
            <LuPlus className="w-4 h-4" />
            Agregar
          </button>
        </div>
      </form>

      <div className="card overflow-hidden">
        <table className="table-modern">
          <thead>
            <tr>
              <th>Código</th>
              <th>Nombre</th>
              <th>Tipo</th>
              <th>Estado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map(u => (
              <tr key={u.id}>
                <td className="font-mono text-sm">{u.code}</td>
                <td className="font-medium">{u.name}</td>
                <td>{u.baseUnit ? 'Base (unidad)' : 'Presentación'}</td>
                <td>{u.active ? 'Activa' : 'Inactiva'}</td>
                <td>
                  {!u.baseUnit && (
                    <button type="button" onClick={() => deactivate(u)} className="text-red-600 hover:text-red-700 p-1" title="Desactivar">
                      <LuTrash2 className="w-4 h-4" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
