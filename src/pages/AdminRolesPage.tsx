/**
 * Panel RBAC (solo PLATFORM_OWNER): matriz de permisos por rol/módulo,
 * gestión de usuarios y toggle de modo mantenimiento.
 */
import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminService, platformService } from '@/services/api'
import { useAuth } from '@/context/AuthContext'
import toast from 'react-hot-toast'
import type { AdminCreateUserRequest, RoleModuleCellDto } from '@/types'
import { 
  LuSettings, 
  LuShield, 
  LuLock, 
  LuLockOpen, 
  LuEye, 
  LuUserPlus, 
  LuSave,
  LuBell,
  LuMail,
  LuUser,
  LuKey,
  LuBuilding2,
} from 'react-icons/lu'

const ORG_ROLE_NAMES = new Set(['MANAGER', 'MEMBER', 'VIEWER'])

function isOrgRoleName(name: string | undefined): boolean {
  return !!name && ORG_ROLE_NAMES.has(name)
}

function cellKey(roleId: number, moduleId: number) {
  return `${roleId}-${moduleId}`
}

export default function AdminRolesPage() {
  const { refreshUser } = useAuth()
  const qc = useQueryClient()
  const { data: rbac, isLoading: rbacLoading } = useQuery({
    queryKey: ['admin', 'rbac'],
    queryFn: () => adminService.getRbac(),
  })
  const { data: roles } = useQuery({
    queryKey: ['admin', 'roles'],
    queryFn: () => adminService.listRoles(),
  })
  const { data: maint } = useQuery({
    queryKey: ['admin', 'maintenance'],
    queryFn: () => adminService.getMaintenance(),
  })
  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: () => adminService.listUsers(),
  })
  const { data: organizations = [] } = useQuery({
    queryKey: ['platform', 'organizations'],
    queryFn: () => platformService.organizations(),
  })

  const [permMap, setPermMap] = useState<Record<string, RoleModuleCellDto>>({})
  const [draftRoles, setDraftRoles] = useState<Record<string, number>>({})
  const [draftOrgIds, setDraftOrgIds] = useState<Record<string, string>>({})

  const [createForm, setCreateForm] = useState<AdminCreateUserRequest>({
    email: '',
    password: '',
    name: '',
    roleId: 0,
    whatsappNumber: '',
    organizationId: '',
  })

  useEffect(() => {
    if (!rbac?.permissions) return
    const next: Record<string, RoleModuleCellDto> = {}
    for (const p of rbac.permissions) {
      next[cellKey(p.roleId, p.moduleId)] = { ...p }
    }
    setPermMap(next)
  }, [rbac])

  // Usa roles del endpoint dedicado (/admin/roles) que es más fiable
  const availableRoles = roles?.length ? roles : (rbac?.roles ?? [])

  useEffect(() => {
    if (!users || !availableRoles.length) return
    const member = availableRoles.find(r => r.name === 'MEMBER')
    const fallbackRoleId = member?.id ?? availableRoles[0].id
    const d: Record<string, number> = {}
    for (const u of users) d[u.id] = u.roleId ?? fallbackRoleId
    setDraftRoles(d)
  }, [users, availableRoles])

  useEffect(() => {
    if (!availableRoles.length || createForm.roleId !== 0) return
    const member = availableRoles.find(r => r.name === 'MEMBER')
    setCreateForm(f => ({ ...f, roleId: member?.id ?? availableRoles[0].id }))
  }, [availableRoles, createForm.roleId])

  const savePerms = useMutation({
    mutationFn: () => adminService.updatePermissions(Object.values(permMap)),
    onSuccess: async () => {
      toast.success('Permisos guardados')
      qc.invalidateQueries({ queryKey: ['admin', 'rbac'] })
      await refreshUser().catch(() => {})
    },
    onError: (e: unknown) => {
      const msg =
        e && typeof e === 'object' && 'response' in e
          ? (e as { response?: { data?: { error?: string } } }).response?.data?.error
          : undefined
      toast.error(msg || 'No se pudieron guardar los permisos')
    },
  })

  const createUser = useMutation({
    mutationFn: (payload: AdminCreateUserRequest) => adminService.createUser(payload),
    onSuccess: () => {
      toast.success('Usuario creado')
      qc.invalidateQueries({ queryKey: ['admin', 'users'] })
      setCreateForm(f => ({
        ...f,
        email: '',
        password: '',
        name: '',
        whatsappNumber: '',
      }))
    },
    onError: (e: unknown) => {
      const msg =
        e && typeof e === 'object' && 'response' in e
          ? (e as { response?: { data?: { error?: string } } }).response?.data?.error
          : undefined
      toast.error(msg || 'Error al crear usuario')
    },
  })

  const patchRole = useMutation({
    mutationFn: ({ id, roleId, organizationId }: { id: string; roleId: number; organizationId?: string }) =>
      adminService.updateUserRole(id, roleId, organizationId),
    onSuccess: () => {
      toast.success('Rol del usuario actualizado')
      qc.invalidateQueries({ queryKey: ['admin', 'users'] })
    },
    onError: (e: unknown) => {
      const msg =
        e && typeof e === 'object' && 'response' in e
          ? (e as { response?: { data?: { error?: string } } }).response?.data?.error
          : undefined
      toast.error(msg || 'No se pudo cambiar el rol')
    },
  })

  const setMaint = useMutation({
    mutationFn: (enabled: boolean) => adminService.setMaintenance(enabled),
    onSuccess: (_data, enabled) => {
      toast.success(enabled ? 'Mantenimiento activado' : 'Mantenimiento desactivado')
      qc.invalidateQueries({ queryKey: ['admin', 'maintenance'] })
    },
    onError: (e: unknown) => {
      const msg =
        e && typeof e === 'object' && 'response' in e
          ? (e as { response?: { data?: { error?: string } } }).response?.data?.error
          : undefined
      toast.error(msg || 'No se pudo cambiar el modo mantenimiento')
    },
  })

  const togglePerm = (
    roleId: number,
    moduleId: number,
    field: 'canCreate' | 'canRead' | 'canUpdate' | 'canDelete',
    value: boolean,
  ) => {
    const k = cellKey(roleId, moduleId)
    setPermMap(prev => {
      const cur = prev[k]
      if (!cur) return prev
      return { ...prev, [k]: { ...cur, [field]: value } }
    })
  }

  const rolesSorted = useMemo(
    () => [...availableRoles].sort((a, b) => a.id - b.id),
    [availableRoles],
  )
  const createRoleName = rolesSorted.find(r => r.id === createForm.roleId)?.name
  const createNeedsOrg = isOrgRoleName(createRoleName)
  const modulesSorted = useMemo(
    () => [...(rbac?.modules ?? [])].sort((a, b) => a.id - b.id),
    [rbac?.modules],
  )

  if (rbacLoading || usersLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-brand-200 border-t-brand-600 animate-spin mx-auto mb-4" />
          <p className="text-sm text-slate-500">Cargando administración...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <LuSettings className="w-8 h-8 text-brand-500" />
          Administración RBAC
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Gestión de usuarios, roles y permisos de módulos (solo PLATFORM_OWNER)
        </p>
      </div>

      <section className="card p-6 bg-gradient-to-r from-amber-50 to-white border-amber-200">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
            <LuBell className="w-6 h-6 text-amber-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-base font-bold text-gray-900 mb-2">Modo mantenimiento</h2>
            <p className="text-sm text-slate-700 mb-4">
              Cuando está activo, usuarios que no son PLATFORM_OWNER pueden iniciar sesión pero la API devuelve error al cargar datos.
              Útil para demostraciones o cortes controlados.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                disabled={setMaint.isPending}
                onClick={() => setMaint.mutate(!(maint?.enabled ?? false))}
                className="btn-primary text-sm py-2.5 px-5 disabled:opacity-50"
              >
                {maint?.enabled ? 'Desactivar mantenimiento' : 'Activar mantenimiento'}
              </button>
              {maint?.enabled && (
                <span className="badge bg-amber-100 text-amber-700 border border-amber-300 font-semibold">
                  ACTIVO
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Crear usuario */}
      <section className="card p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center">
            <LuUserPlus className="w-5 h-5 text-brand-600" />
          </div>
          <h2 className="text-base font-bold text-gray-900">Crear usuario</h2>
        </div>
        <form
          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          onSubmit={e => {
            e.preventDefault()
            if (!createForm.roleId) {
              toast.error('Selecciona un rol')
              return
            }
            if (createNeedsOrg && !createForm.organizationId?.trim()) {
              toast.error('Selecciona la organización para MANAGER, MEMBER o VIEWER')
              return
            }
            createUser.mutate({
              ...createForm,
              whatsappNumber: createForm.whatsappNumber?.trim() || undefined,
              organizationId: createNeedsOrg ? createForm.organizationId?.trim() : undefined,
            })
          }}
        >
          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-slate-600 block mb-1.5">Nombre completo</label>
            <div className="relative">
              <LuUser className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                className="input pl-10"
                placeholder="Juan Pérez"
                value={createForm.name}
                onChange={e => setCreateForm(f => ({ ...f, name: e.target.value }))}
                required
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1.5">Correo electrónico</label>
            <div className="relative">
              <LuMail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                className="input pl-10"
                type="email"
                placeholder="juan@empresa.com"
                value={createForm.email}
                onChange={e => setCreateForm(f => ({ ...f, email: e.target.value }))}
                required
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1.5">Contraseña</label>
            <div className="relative">
              <LuKey className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                className="input pl-10"
                type="password"
                placeholder="Mínimo 6 caracteres"
                minLength={6}
                value={createForm.password}
                onChange={e => setCreateForm(f => ({ ...f, password: e.target.value }))}
                required
              />
            </div>
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-slate-600 block mb-1.5">Rol</label>
            <select
              className="input"
              value={createForm.roleId || ''}
              onChange={e => {
                const roleId = Number(e.target.value)
                setCreateForm(f => ({
                  ...f,
                  roleId,
                  organizationId: isOrgRoleName(rolesSorted.find(r => r.id === roleId)?.name)
                    ? f.organizationId
                    : '',
                }))
              }}
              required
            >
              <option value="" disabled>
                Seleccionar rol...
              </option>
              {rolesSorted.map(r => (
                <option key={r.id} value={r.id}>
                  {r.name === 'PLATFORM_OWNER' ? `${r.name} (plataforma)` : `${r.name} (organización)`}
                </option>
              ))}
            </select>
            <p className="text-xs text-slate-500 mt-1.5">
              {createRoleName === 'PLATFORM_OWNER'
                ? 'Administra la plataforma; no opera inventario de una empresa.'
                : createNeedsOrg
                  ? 'MANAGER, MEMBER y VIEWER deben pertenecer a una organización.'
                  : 'Selecciona un rol para ver requisitos.'}
            </p>
          </div>
          {createNeedsOrg && (
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">
                Organización *
              </label>
              <div className="relative">
                <LuBuilding2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <select
                  className="input pl-10"
                  value={createForm.organizationId ?? ''}
                  onChange={e => setCreateForm(f => ({ ...f, organizationId: e.target.value }))}
                  required
                >
                  <option value="" disabled>
                    Seleccionar organización...
                  </option>
                  {organizations.map(o => (
                    <option key={o.id} value={o.id}>
                      {o.name} ({o.memberCount}/{o.maxMembers} miembros)
                    </option>
                  ))}
                </select>
              </div>
              {organizations.length === 0 && (
                <p className="text-xs text-amber-700 mt-1.5">
                  No hay organizaciones. Créalas desde la pestaña Plataforma o vía onboarding.
                </p>
              )}
            </div>
          )}
          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-slate-600 block mb-1.5">WhatsApp (opcional)</label>
            <input
              className="input"
              placeholder="+51999999999"
              value={createForm.whatsappNumber}
              onChange={e => setCreateForm(f => ({ ...f, whatsappNumber: e.target.value }))}
            />
          </div>
          <div className="sm:col-span-2">
            <button
              type="submit"
              className="btn-primary w-full"
              disabled={createUser.isPending}
            >
              <LuUserPlus className="w-4 h-4" />
              {createUser.isPending ? 'Creando…' : 'Crear usuario'}
            </button>
          </div>
        </form>
      </section>

      {/* Usuarios */}
      <section className="card overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <LuShield className="w-5 h-5 text-brand-600" />
            <h2 className="text-base font-bold text-gray-900">Gestión de usuarios</h2>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="table-modern">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Organización</th>
                <th>Rol</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {(users ?? []).map(u => {
                const draft = draftRoles[u.id] ?? u.roleId ?? 0
                const baseline = u.roleId ?? 0
                const draftRoleName = rolesSorted.find(r => r.id === draft)?.name
                const needsOrgPicker = isOrgRoleName(draftRoleName) && !u.organizationId
                const draftOrg = draftOrgIds[u.id] ?? ''
                const changed = draft !== baseline
                return (
                  <tr key={u.id}>
                    <td className="font-semibold text-gray-900">{u.name}</td>
                    <td className="text-slate-600">{u.email}</td>
                    <td className="text-slate-600 text-sm">
                      {u.organizationName ?? (
                        needsOrgPicker ? (
                          <select
                            className="input py-1.5 text-xs w-full max-w-[180px]"
                            value={draftOrg}
                            onChange={e =>
                              setDraftOrgIds(d => ({ ...d, [u.id]: e.target.value }))
                            }
                          >
                            <option value="">Elegir org…</option>
                            {organizations.map(o => (
                              <option key={o.id} value={o.id}>{o.name}</option>
                            ))}
                          </select>
                        ) : (
                          <span className="text-slate-400 italic">—</span>
                        )
                      )}
                    </td>
                    <td>
                      <select
                        className="input py-2 text-sm w-40"
                        value={draft}
                        onChange={e =>
                          setDraftRoles(d => ({
                            ...d,
                            [u.id]: Number(e.target.value),
                          }))
                        }
                      >
                        {rolesSorted.map(r => (
                          <option key={r.id} value={r.id}>
                            {r.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <button
                        type="button"
                        className={`btn-secondary text-xs py-2 px-4 ${changed ? '!bg-accent-50 !text-accent-700 !border-accent-300' : ''}`}
                        disabled={!changed || patchRole.isPending || (needsOrgPicker && !draftOrg)}
                        onClick={() =>
                          patchRole.mutate({
                            id: u.id,
                            roleId: draft,
                            organizationId: needsOrgPicker ? draftOrg : undefined,
                          })
                        }
                      >
                        <LuSave className="w-3.5 h-3.5 mr-1.5 inline" />
                        {changed ? 'Guardar cambio' : 'Sin cambios'}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Matriz permisos */}
      <section className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <LuLock className="w-5 h-5 text-brand-600" />
            <h2 className="text-base font-bold text-gray-900">Permisos por rol y módulo</h2>
          </div>
          <button
            type="button"
            className="btn-primary"
            disabled={savePerms.isPending || !Object.keys(permMap).length}
            onClick={() => savePerms.mutate()}
          >
            <LuSave className="w-4 h-4" />
            {savePerms.isPending ? 'Guardando…' : 'Guardar permisos'}
          </button>
        </div>

        <div className="space-y-5">
          {rolesSorted.map(role => (
            <div key={role.id} className="card overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-brand-50 to-white border-b border-brand-200">
                <div className="flex items-center gap-2">
                  <LuShield className="w-5 h-5 text-brand-600" />
                  <p className="text-base font-bold text-brand-700">
                    {role.name}
                  </p>
                </div>
              </div>
              <div className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[600px]">
                  <thead>
                    <tr className="text-left bg-slate-50 border-b border-gray-200">
                      <th className="py-3 pr-4 font-semibold text-slate-700">Módulo</th>
                      <th className="py-3 px-3 font-semibold text-center text-slate-700">
                        <div className="flex items-center justify-center gap-1.5">
                          <LuUserPlus className="w-4 h-4" />
                          Crear
                        </div>
                      </th>
                      <th className="py-3 px-3 font-semibold text-center text-slate-700">
                        <div className="flex items-center justify-center gap-1.5">
                          <LuEye className="w-4 h-4" />
                          Leer
                        </div>
                      </th>
                      <th className="py-3 px-3 font-semibold text-center text-slate-700">
                        <div className="flex items-center justify-center gap-1.5">
                          <LuLockOpen className="w-4 h-4" />
                          Actualizar
                        </div>
                      </th>
                      <th className="py-3 px-3 font-semibold text-center text-slate-700">
                        <div className="flex items-center justify-center gap-1.5">
                          <LuLock className="w-4 h-4" />
                          Eliminar
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {modulesSorted.map(mod => {
                      const cell = permMap[cellKey(role.id, mod.id)]
                      if (!cell) {
                        return (
                          <tr key={mod.id} className="border-b border-gray-100">
                            <td className="py-3 text-slate-500 italic" colSpan={5}>
                              {mod.name} — sin fila (recarga datos)
                            </td>
                          </tr>
                        )
                      }
                      return (
                        <tr key={mod.id} className="border-b border-gray-100 hover:bg-slate-50 transition-colors">
                          <td className="py-3 pr-4">
                            <div>
                              <p className="font-semibold text-gray-900">{mod.name}</p>
                              <p className="text-xs text-slate-500">({mod.key})</p>
                            </div>
                          </td>
                          {(
                            [
                              ['canCreate', cell.canCreate],
                              ['canRead', cell.canRead],
                              ['canUpdate', cell.canUpdate],
                              ['canDelete', cell.canDelete],
                            ] as const
                          ).map(([field, checked]) => (
                            <td key={field} className="py-3 px-3 text-center">
                              <input
                                type="checkbox"
                                className="w-5 h-5 rounded border-gray-300 text-brand-600 focus:ring-2 focus:ring-brand-500 cursor-pointer"
                                checked={checked}
                                onChange={e =>
                                  togglePerm(role.id, mod.id, field, e.target.checked)
                                }
                              />
                            </td>
                          ))}
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
