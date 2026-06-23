/** Vista global de tenants, solicitudes pendientes y usuarios (PLATFORM_OWNER) */
import { useEffect, useState } from 'react'
import { adminService, platformService } from '@/services/api'
import type { PendingOrgDto, PlatformOrganizationRow, PlatformUserRow } from '@/types'
import toast from 'react-hot-toast'
import { LuGlobe, LuBuilding2, LuUsers, LuSettings2, LuPlus, LuMinus, LuClock, LuCheck, LuX } from 'react-icons/lu'

export default function PlatformAdminPage() {
  const [orgs, setOrgs] = useState<PlatformOrganizationRow[]>([])
  const [pending, setPending] = useState<PendingOrgDto[]>([])
  const [users, setUsers] = useState<PlatformUserRow[]>([])
  const [tab, setTab] = useState<'pending' | 'orgs' | 'users'>('pending')
  const [reviewingId, setReviewingId] = useState<string | null>(null)

  const load = () => {
    adminService.listOrganizations('PENDING').then(setPending).catch(() => toast.error('Error cargando solicitudes'))
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

  const review = async (orgId: string, action: 'APPROVE' | 'REJECT') => {
    setReviewingId(orgId)
    try {
      await adminService.reviewOrganization(orgId, action)
      toast.success(action === 'APPROVE' ? 'Organización aprobada' : 'Solicitud rechazada')
      load()
    } catch {
      toast.error('No se pudo procesar la solicitud')
    } finally {
      setReviewingId(null)
    }
  }

  const formatDate = (iso?: string) => {
    if (!iso) return '—'
    try {
      return new Date(iso).toLocaleDateString('es-MX', { dateStyle: 'medium' })
    } catch {
      return iso
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

      <div className="flex gap-3 mb-6 p-1.5 bg-slate-100 rounded-xl w-fit flex-wrap">
        <button
          type="button"
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${tab === 'pending' ? 'bg-white text-gray-900 shadow-md' : 'text-slate-600 hover:text-slate-900'}`}
          onClick={() => setTab('pending')}
        >
          <LuClock className="w-4 h-4" />
          Solicitudes
          {pending.length > 0 && (
            <span className="ml-1 px-1.5 py-0.5 text-xs font-bold bg-amber-500 text-white rounded-full">
              {pending.length}
            </span>
          )}
        </button>
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

      {tab === 'pending' && (
        <div className="card overflow-hidden">
          {pending.length === 0 ? (
            <p className="p-8 text-center text-sm text-slate-500">No hay solicitudes pendientes de aprobación.</p>
          ) : (
            <table className="table-modern">
              <thead>
                <tr>
                  <th>Organización</th>
                  <th>Manager</th>
                  <th>País</th>
                  <th>Fecha</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {pending.map(p => (
                  <tr key={p.orgId}>
                    <td>
                      <p className="font-semibold text-gray-900">{p.orgName}</p>
                      {p.industry && <p className="text-xs text-slate-500">{p.industry}</p>}
                    </td>
                    <td>
                      <p className="font-medium text-gray-900">{p.managerName ?? '—'}</p>
                      <p className="text-xs text-slate-500">{p.managerEmail ?? '—'}</p>
                    </td>
                    <td className="text-slate-700">{p.country ?? '—'}</td>
                    <td className="text-slate-600 text-sm">{formatDate(p.createdAt)}</td>
                    <td>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          className="flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-700 text-xs font-semibold rounded-lg hover:bg-green-100 border border-green-200 transition-colors disabled:opacity-50"
                          disabled={reviewingId === p.orgId}
                          onClick={() => review(p.orgId, 'APPROVE')}
                        >
                          <LuCheck className="w-3 h-3" />
                          Aprobar
                        </button>
                        <button
                          type="button"
                          className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-700 text-xs font-semibold rounded-lg hover:bg-red-100 border border-red-200 transition-colors disabled:opacity-50"
                          disabled={reviewingId === p.orgId}
                          onClick={() => review(p.orgId, 'REJECT')}
                        >
                          <LuX className="w-3 h-3" />
                          Rechazar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

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
