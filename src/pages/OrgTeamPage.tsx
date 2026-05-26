import { useEffect, useState } from 'react'
import { organizationService } from '@/services/api'
import type { OrgMemberDto } from '@/types'
import toast from 'react-hot-toast'
import { LuUsers, LuUserPlus, LuShield, LuTrash2, LuMail, LuUser, LuLock, LuX } from 'react-icons/lu'

export default function OrgTeamPage() {
  const [members, setMembers] = useState<OrgMemberDto[]>([])
  const [form, setForm] = useState({ email: '', password: '', name: '', orgRole: 'MEMBER' })
  const [showForm, setShowForm] = useState(false)

  const load = () => organizationService.members().then(setMembers).catch(() => toast.error('Error cargando equipo'))

  useEffect(() => { load() }, [])

  const add = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await organizationService.addMember(form)
      toast.success('Miembro agregado')
      setShowForm(false)
      setForm({ email: '', password: '', name: '', orgRole: 'MEMBER' })
      load()
    } catch {
      toast.error('No se pudo agregar miembro')
    }
  }

  const remove = async (id: string) => {
    if (!confirm('¿Eliminar este miembro del equipo?')) return
    await organizationService.removeMember(id)
    load()
    toast.success('Miembro eliminado')
  }

  const getRoleBadge = (role: string) => {
    const styles = {
      MANAGER: 'bg-brand-100 text-brand-700 border-brand-200',
      MEMBER: 'bg-blue-100 text-blue-700 border-blue-200',
      VIEWER: 'bg-slate-100 text-slate-700 border-slate-200',
    }
    return styles[role as keyof typeof styles] || styles.MEMBER
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <LuUsers className="w-8 h-8 text-brand-500" />
            Equipo
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            {members.length} {members.length === 1 ? 'miembro' : 'miembros'} en tu organización
          </p>
        </div>
        <button type="button" className="btn-primary" onClick={() => setShowForm(v => !v)}>
          {showForm ? <LuX className="w-4 h-4" /> : <LuUserPlus className="w-4 h-4" />}
          {showForm ? 'Cancelar' : 'Invitar miembro'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={add} className="card p-6 mb-8">
          <h2 className="text-base font-bold text-gray-900 mb-5">Agregar nuevo miembro</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">Nombre completo</label>
              <div className="relative">
                <LuUser className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  className="input pl-10" 
                  placeholder="Juan Pérez" 
                  value={form.name} 
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))} 
                  required 
                />
              </div>
            </div>
            <div className="col-span-2 md:col-span-1">
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">Email</label>
              <div className="relative">
                <LuMail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  className="input pl-10" 
                  placeholder="juan@empresa.com" 
                  type="email" 
                  value={form.email} 
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))} 
                  required 
                />
              </div>
            </div>
            <div className="col-span-2 md:col-span-1">
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">Contraseña temporal</label>
              <div className="relative">
                <LuLock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  className="input pl-10" 
                  placeholder="Mínimo 6 caracteres" 
                  type="password" 
                  value={form.password} 
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))} 
                  required 
                />
              </div>
            </div>
            <div className="col-span-2">
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">Rol en la organización</label>
              <select 
                className="input" 
                value={form.orgRole} 
                onChange={e => setForm(f => ({ ...f, orgRole: e.target.value }))}
              >
                <option value="MEMBER">Miembro (puede editar y gestionar inventario)</option>
                <option value="VIEWER">Solo lectura (puede ver pero no modificar)</option>
              </select>
            </div>
          </div>
          <button type="submit" className="btn-primary w-full mt-6">
            <LuUserPlus className="w-4 h-4" />
            Agregar miembro
          </button>
        </form>
      )}

      <div className="card overflow-hidden">
        <table className="table-modern">
          <thead>
            <tr>
              <th>Miembro</th>
              <th>Rol</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {members.map(m => (
              <tr key={m.id}>
                <td>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                      {m.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{m.name}</p>
                      <p className="text-xs text-slate-500">{m.email}</p>
                    </div>
                  </div>
                </td>
                <td>
                  <span className={`badge ${getRoleBadge(m.orgRole)} border`}>
                    <LuShield className="w-3 h-3 mr-1" />
                    {m.orgRole === 'MANAGER' ? 'Manager' : m.orgRole === 'MEMBER' ? 'Miembro' : 'Solo lectura'}
                  </span>
                </td>
                <td>
                  {m.orgRole !== 'MANAGER' ? (
                    <button 
                      type="button" 
                      className="flex items-center gap-1.5 text-red-600 text-sm font-medium hover:text-red-700" 
                      onClick={() => remove(m.id)}
                    >
                      <LuTrash2 className="w-4 h-4" />
                      Eliminar
                    </button>
                  ) : (
                    <span className="text-xs text-slate-400 italic">No se puede eliminar</span>
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
