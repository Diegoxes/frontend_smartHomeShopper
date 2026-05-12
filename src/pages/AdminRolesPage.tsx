import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminService } from '@/services/api'
import { useAuth } from '@/context/AuthContext'
import toast from 'react-hot-toast'
import type { AdminCreateUserRequest, RoleModuleCellDto } from '@/types'

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
  const { data: maint } = useQuery({
    queryKey: ['admin', 'maintenance'],
    queryFn: () => adminService.getMaintenance(),
  })
  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: () => adminService.listUsers(),
  })

  const [permMap, setPermMap] = useState<Record<string, RoleModuleCellDto>>({})
  const [draftRoles, setDraftRoles] = useState<Record<string, number>>({})

  const [createForm, setCreateForm] = useState<AdminCreateUserRequest>({
    email: '',
    password: '',
    name: '',
    roleId: 0,
    whatsappNumber: '',
  })

  useEffect(() => {
    if (!rbac?.permissions) return
    const next: Record<string, RoleModuleCellDto> = {}
    for (const p of rbac.permissions) {
      next[cellKey(p.roleId, p.moduleId)] = { ...p }
    }
    setPermMap(next)
  }, [rbac])

  useEffect(() => {
    if (!users || !rbac?.roles?.length) return
    const member = rbac.roles.find(r => r.name === 'MEMBER')
    const fallbackRoleId = member?.id ?? rbac.roles[0].id
    const d: Record<string, number> = {}
    for (const u of users) d[u.id] = u.roleId ?? fallbackRoleId
    setDraftRoles(d)
  }, [users, rbac?.roles])

  useEffect(() => {
    if (!rbac?.roles?.length || createForm.roleId !== 0) return
    const member = rbac.roles.find(r => r.name === 'MEMBER')
    setCreateForm(f => ({ ...f, roleId: member?.id ?? rbac.roles[0].id }))
  }, [rbac, createForm.roleId])

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
    mutationFn: ({ id, roleId }: { id: string; roleId: number }) =>
      adminService.updateUserRole(id, roleId),
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
    () => [...(rbac?.roles ?? [])].sort((a, b) => a.id - b.id),
    [rbac?.roles],
  )
  const modulesSorted = useMemo(
    () => [...(rbac?.modules ?? [])].sort((a, b) => a.id - b.id),
    [rbac?.modules],
  )

  if (rbacLoading || usersLoading) {
    return <p className="text-sm text-gray-400 pt-4">Cargando administración…</p>
  }

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Administración</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          Solo el rol OWNER puede gestionar usuarios y permisos de módulos.
        </p>
      </div>

      <section className="card p-6 border-amber-100 bg-amber-50/40">
        <h2 className="text-sm font-semibold text-gray-800 mb-1">Modo mantenimiento</h2>
        <p className="text-xs text-gray-500 mb-4">
          Cuando está activo, usuarios que no son OWNER pueden iniciar sesión pero la API devuelve error al cargar datos.
          Útil para demostraciones o cortes controlados.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled={setMaint.isPending}
            onClick={() => setMaint.mutate(!(maint?.enabled ?? false))}
            className="btn-primary text-sm py-2 px-4 disabled:opacity-50"
          >
            {maint?.enabled ? 'Desactivar mantenimiento' : 'Activar mantenimiento'}
          </button>
          {maint?.enabled && (
            <span className="text-xs font-semibold text-amber-700 uppercase tracking-wide">Activo</span>
          )}
        </div>
      </section>

      {/* Crear usuario */}
      <section className="card p-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Crear usuario</h2>
        <form
          className="grid grid-cols-1 sm:grid-cols-2 gap-3"
          onSubmit={e => {
            e.preventDefault()
            if (!createForm.roleId) {
              toast.error('Selecciona un rol')
              return
            }
            createUser.mutate({
              ...createForm,
              whatsappNumber: createForm.whatsappNumber?.trim() || undefined,
            })
          }}
        >
          <input
            className="input"
            placeholder="Nombre completo"
            value={createForm.name}
            onChange={e => setCreateForm(f => ({ ...f, name: e.target.value }))}
            required
          />
          <input
            className="input"
            type="email"
            placeholder="Correo"
            value={createForm.email}
            onChange={e => setCreateForm(f => ({ ...f, email: e.target.value }))}
            required
          />
          <input
            className="input"
            type="password"
            placeholder="Contraseña (mín. 6)"
            minLength={6}
            value={createForm.password}
            onChange={e => setCreateForm(f => ({ ...f, password: e.target.value }))}
            required
          />
          <select
            className="input"
            value={createForm.roleId || ''}
            onChange={e =>
              setCreateForm(f => ({ ...f, roleId: Number(e.target.value) }))
            }
            required
          >
            <option value="" disabled>
              Rol…
            </option>
            {rolesSorted.map(r => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
          <input
            className="input sm:col-span-2"
            placeholder="WhatsApp (opcional)"
            value={createForm.whatsappNumber}
            onChange={e => setCreateForm(f => ({ ...f, whatsappNumber: e.target.value }))}
          />
          <div className="sm:col-span-2">
            <button
              type="submit"
              className="btn-primary"
              disabled={createUser.isPending}
            >
              {createUser.isPending ? 'Creando…' : 'Crear usuario'}
            </button>
          </div>
        </form>
      </section>

      {/* Usuarios */}
      <section className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700">Usuarios</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 border-b border-gray-50">
                <th className="px-6 py-3 font-medium">Nombre</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Rol</th>
                <th className="px-6 py-3 font-medium w-32" />
              </tr>
            </thead>
            <tbody>
              {(users ?? []).map(u => {
                const draft = draftRoles[u.id] ?? u.roleId ?? 0
                const baseline = u.roleId ?? 0
                const changed = draft !== baseline
                return (
                  <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50/80">
                    <td className="px-6 py-3 text-gray-800">{u.name}</td>
                    <td className="px-4 py-3 text-gray-500">{u.email}</td>
                    <td className="px-4 py-3">
                      <select
                        className="input py-1.5 text-sm max-w-[9rem]"
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
                    <td className="px-6 py-3">
                      <button
                        type="button"
                        className="btn-secondary text-xs py-1.5"
                        disabled={!changed || patchRole.isPending}
                        onClick={() => patchRole.mutate({ id: u.id, roleId: draft })}
                      >
                        Guardar rol
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
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-gray-700">Permisos por rol y módulo</h2>
          <button
            type="button"
            className="btn-primary"
            disabled={savePerms.isPending || !Object.keys(permMap).length}
            onClick={() => savePerms.mutate()}
          >
            {savePerms.isPending ? 'Guardando…' : 'Guardar permisos'}
          </button>
        </div>

        <div className="space-y-4">
          {rolesSorted.map(role => (
            <div key={role.id} className="card p-5">
              <p className="text-xs font-semibold text-brand-600 uppercase tracking-wide mb-3">
                {role.name}
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-xs min-w-[520px]">
                  <thead>
                    <tr className="text-left text-gray-400 border-b border-gray-100">
                      <th className="py-2 pr-4 font-medium">Módulo</th>
                      <th className="py-2 px-2 font-medium text-center">Crear</th>
                      <th className="py-2 px-2 font-medium text-center">Leer</th>
                      <th className="py-2 px-2 font-medium text-center">Actualizar</th>
                      <th className="py-2 px-2 font-medium text-center">Eliminar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {modulesSorted.map(mod => {
                      const cell = permMap[cellKey(role.id, mod.id)]
                      if (!cell) {
                        return (
                          <tr key={mod.id} className="border-b border-gray-50">
                            <td className="py-2 text-gray-500" colSpan={5}>
                              {mod.name} — sin fila (recarga datos)
                            </td>
                          </tr>
                        )
                      }
                      return (
                        <tr key={mod.id} className="border-b border-gray-50">
                          <td className="py-2 pr-4 text-gray-700">
                            <span className="font-medium">{mod.name}</span>
                            <span className="text-gray-400 ml-2">({mod.key})</span>
                          </td>
                          {(
                            [
                              ['canCreate', cell.canCreate],
                              ['canRead', cell.canRead],
                              ['canUpdate', cell.canUpdate],
                              ['canDelete', cell.canDelete],
                            ] as const
                          ).map(([field, checked]) => (
                            <td key={field} className="py-2 px-2 text-center">
                              <input
                                type="checkbox"
                                className="w-4 h-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
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
          ))}
        </div>
      </section>
    </div>
  )
}
