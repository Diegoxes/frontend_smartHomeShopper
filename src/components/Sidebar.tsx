import { useAuth } from '@/context/AuthContext'

type Page = 'dashboard' | 'inventory' | 'alerts' | 'stats' | 'whatsapp'

const NAV: { key: Page; label: string; icon: string }[] = [
  { key: 'dashboard', label: 'Dashboard',    icon: '🏠' },
  { key: 'inventory', label: 'Inventario',   icon: '📦' },
  { key: 'alerts',    label: 'Alertas',      icon: '⚠️' },
  { key: 'stats',     label: 'Estadísticas', icon: '📊' },
  { key: 'whatsapp',  label: 'WhatsApp',     icon: '💬' },
]

interface Props {
  active: Page
  onNav: (page: Page) => void
}

export default function Sidebar({ active, onNav }: Props) {
  const { user, logout } = useAuth()

  return (
    <aside className="w-56 min-h-screen bg-white border-r border-gray-100 flex flex-col py-5 shrink-0">
      {/* Logo */}
      <div className="px-5 pb-5 border-b border-gray-100 mb-2">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center text-xl">🛒</div>
          <div>
            <p className="text-sm font-semibold text-gray-800 leading-tight">SmartHome</p>
            <p className="text-xs text-gray-400">Shopper</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 pt-2 space-y-0.5">
        {NAV.map(({ key, label, icon }) => (
          <button
            key={key}
            onClick={() => onNav(key)}
            className={[
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm transition-colors',
              active === key
                ? 'bg-brand-50 text-brand-700 font-medium'
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700',
            ].join(' ')}
          >
            <span className="text-base leading-none">{icon}</span>
            {label}
          </button>
        ))}
      </nav>

      {/* User + logout */}
      <div className="px-3 pt-3 border-t border-gray-100 space-y-1">
        {user && (
          <div className="px-3 py-2">
            <p className="text-xs font-medium text-gray-700 truncate">{user.name}</p>
            <p className="text-xs text-gray-400 truncate">{user.email}</p>
          </div>
        )}
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors"
        >
          <span className="text-base leading-none">🚪</span>
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
