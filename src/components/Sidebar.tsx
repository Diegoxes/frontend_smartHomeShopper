import { useMemo } from 'react'
import { useAuth } from '@/context/AuthContext'
import type { AppPage } from '@/types'
import { MOD, modulePerm, isPlatformOwner, isOrgManager } from '@/lib/permissions'
import { 
  LuLayoutDashboard, 
  LuPackage, 
  LuBell, 
  LuShoppingCart, 
  LuStore, 
  LuMessageSquare, 
  LuTrendingUp, 
  LuUsers, 
  LuGlobe, 
  LuSettings, 
  LuLogOut 
} from 'react-icons/lu'

interface Props {
  active: AppPage
  onNav: (page: AppPage) => void
}

type NavItem = { 
  key: AppPage
  label: string
  icon: React.ComponentType<{ className?: string }>
}

export default function Sidebar({ active, onNav }: Props) {
  const { user, logout } = useAuth()

  const navItems = useMemo(() => {
    const inv = modulePerm(user, MOD.INVENTORY)
    const rep = modulePerm(user, MOD.REPORTS)
    const pur = modulePerm(user, MOD.PURCHASES)
    const items: NavItem[] = []
    if (inv.canRead) {
      items.push({ key: 'dashboard', label: 'Dashboard', icon: LuLayoutDashboard })
      items.push({ key: 'inventory', label: 'Inventario', icon: LuPackage })
      items.push({ key: 'alerts', label: 'Alertas', icon: LuBell })
    }
    if (pur.canRead) {
      items.push({ key: 'purchases', label: 'Compras', icon: LuShoppingCart })
      items.push({ key: 'suppliers', label: 'Proveedores', icon: LuStore })
      items.push({ key: 'whatsapp', label: 'WhatsApp', icon: LuMessageSquare })
    }
    if (rep.canRead) items.push({ key: 'stats', label: 'Reportes', icon: LuTrendingUp })
    if (isOrgManager(user)) items.push({ key: 'team', label: 'Equipo', icon: LuUsers })
    if (isPlatformOwner(user)) {
      items.push({ key: 'platform', label: 'Plataforma', icon: LuGlobe })
      items.push({ key: 'admin', label: 'RBAC', icon: LuSettings })
    }
    return items
  }, [user])

  const userInitials = user?.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U'

  return (
    <aside className="w-64 min-h-screen bg-slate-50 border-r border-gray-200 flex flex-col py-6 shrink-0">
      <div className="px-6 pb-6 border-b border-gray-200 mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center shadow-sm">
            <LuPackage className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900 leading-tight">SmartInventory</p>
            <p className="text-xs text-slate-500">B2B SaaS</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 pt-2 space-y-1">
        {navItems.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => onNav(key)}
            className={[
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm font-medium transition-all',
              active === key 
                ? 'bg-brand-100 text-brand-700 shadow-sm' 
                : 'text-slate-600 hover:bg-white hover:text-slate-900 hover:shadow-sm',
            ].join(' ')}
          >
            <Icon className="w-4 h-4 shrink-0" />
            {label}
          </button>
        ))}
      </nav>

      <div className="px-4 pt-4 border-t border-gray-200 space-y-2">
        {user && (
          <div className="px-3 py-3 bg-white rounded-lg border border-gray-200 mb-2">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                {userInitials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-gray-900 truncate">{user.name}</p>
                <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
              </div>
            </div>
            <div className="pt-2 border-t border-gray-100">
              <p className="text-[10px] text-slate-500">Rol: <span className="font-medium text-slate-700">{user.role}</span></p>
            </div>
          </div>
        )}
        <button 
          type="button" 
          onClick={logout} 
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all"
        >
          <LuLogOut className="w-4 h-4" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
