import { useEffect, useState } from 'react'
import { platformService } from '@/services/api'
import type { PlatformOrganizationRow, PlatformUserRow } from '@/types'
import toast from 'react-hot-toast'
import { LuGlobe, LuBuilding2, LuUsers, LuSettings2, LuPlus, LuMinus } from 'react-icons/lu'

export default function PlatformAdminPage() {
  const [orgs, setOrgs] = useState<PlatformOrganizationRow[]>([])
  const [users, setUsers] = useState<PlatformUserRow[]>([])
  const [tab, setTab] = useState<'orgs' | 'users'>('orgs')

  const load = () => {
    platformService.organizations().then(setOrgs).catch(() => toast.error('Error cargando organizaciones'))
    platformService.users().then(setUsers).catch(() => toast.error('Error cargando usuarios'))
  }

  useEffect(() => { load() }, [])

  const updateMax = async (orgId: string, max: number) => {
    try {
      await platformService.setMaxMembers(orgId, max)
      toast.success('Límite actualizado')
      load()
    } catch {
      toast.error('No se pudo actualizar')
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <LuGlobe className="w-8 h-8 text-brand-500" />
          Administración de Plataforma
        </h1>
        <p className="text-sm text-slate-600 mt-1">Vista global de organizaciones y usuarios</p>
      </div>

      <div className="flex gap-3 mb-6 p-1.5 bg-slate-100 rounded-xl w-fit">
        <button 
          type="button" 
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${tab === 'orgs' ? 'bg-white text-gray-900 shadow-md' : 'text-slate-600 hover:text-slate-900'}`}
          onClick={() => setTab('orgs')}
        >
          <LuBuilding2 className="w-4 h-4" />
          Organizaciones
        </button>
        <button 
          type="button" 
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${tab === 'users' ? 'bg-white text-gray-900 shadow-md' : 'text-slate-600 hover:text-slate-900'}`}
          onClick={() => setTab('users')}
        >
          <LuUsers className="w-4 h-4" />
          Usuarios
        </button>
      </div>

      {tab === 'orgs' && (
        <div className="card overflow-hidden">
          <table className="table-modern">
            <thead>
              <tr>
                <th>
                  <div className="flex items-center gap-2">
                    <LuBuilding2 className="w-3.5 h-3.5" />
                    Organización
                  </div>
                </th>
                <th>Miembros</th>
                <th>Límite</th>
                <th>
                  <div className="flex items-center gap-2">
                    <LuSettings2 className="w-3.5 h-3.5" />
                    Acciones
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {orgs.map(o => (
                <tr key={o.id}>
                  <td className="font-semibold text-gray-900">{o.name}</td>
                  <td>
                    <span className="badge bg-blue-100 text-blue-700">
                      {o.memberCount} {o.memberCount === 1 ? 'miembro' : 'miembros'}
                    </span>
                  </td>
                  <td className="font-semibold tabular-nums">{o.maxMembers}</td>
                  <td>
                    <div className="flex gap-2">
                      <button 
                        type="button" 
                        className="flex items-center gap-1 px-3 py-1.5 bg-accent-50 text-accent-700 text-xs font-semibold rounded-lg hover:bg-accent-100 border border-accent-200 transition-colors" 
                        onClick={() => updateMax(o.id, o.maxMembers + 5)}
                      >
                        <LuPlus className="w-3 h-3" />
                        +5
                      </button>
                      <button 
                        type="button" 
                        className="flex items-center gap-1 px-3 py-1.5 bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-100 border border-slate-200 transition-colors" 
                        onClick={() => updateMax(o.id, Math.max(1, o.maxMembers - 5))}
                      >
                        <LuMinus className="w-3 h-3" />
                        -5
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'users' && (
        <div className="card overflow-hidden">
          <table className="table-modern">
            <thead>
              <tr>
                <th>
                  <div className="flex items-center gap-2">
                    <LuUsers className="w-3.5 h-3.5" />
                    Usuario
                  </div>
                </th>
                <th>Organización</th>
                <th>Rol organizacional</th>
                <th>Rol plataforma</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td>
                    <div>
                      <p className="font-semibold text-gray-900">{u.name}</p>
                      <p className="text-xs text-slate-500">{u.email}</p>
                    </div>
                  </td>
                  <td className="text-slate-700">{u.orgName ?? '—'}</td>
                  <td>
                    <span className="badge bg-blue-100 text-blue-700 border border-blue-200">
                      {u.orgRole ?? '—'}
                    </span>
                  </td>
                  <td>
                    <span className="badge bg-brand-100 text-brand-700 border border-brand-200">
                      {u.platformRole ?? '—'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
