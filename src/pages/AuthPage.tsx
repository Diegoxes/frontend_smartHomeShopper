import { useState, useEffect } from 'react'
import { authService } from '@/services/api'
import { useAuth } from '@/context/AuthContext'
import toast from 'react-hot-toast'

type Mode = 'login' | 'register'

export default function AuthPage() {
  const { login } = useAuth()
  const [mode, setMode] = useState<Mode>('login')
  const [form, setForm] = useState({ email: '', password: '', name: '', whatsappNumber: '' })
  const [busy, setBusy] = useState(false)
  const [maintenanceOn, setMaintenanceOn] = useState(false)

  useEffect(() => {
    authService
      .maintenanceStatus()
      .then(s => setMaintenanceOn(s.enabled))
      .catch(() => {})
  }, [])

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    try {
      const res = mode === 'login'
        ? await authService.login({ email: form.email, password: form.password })
        : await authService.register(form)
      login(res)
      toast.success(`Bienvenido, ${res.name}!`)
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Error al conectar. Verifica el servidor.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">

        {/* logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center text-4xl mx-auto mb-4">🛒</div>
          <h1 className="text-xl font-bold text-gray-800">SmartHome Shopper</h1>
          <p className="text-sm text-gray-400 mt-1">Inventario inteligente del hogar</p>
        </div>

        {maintenanceOn && (
          <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            <strong>Mantenimiento activo:</strong> solo la cuenta administrador (OWNER) puede usar la app. El resto de usuarios verán un mensaje tras iniciar sesión.
          </div>
        )}

        <div className="card p-6">
          {/* tabs */}
          <div className="flex p-1 bg-gray-50 rounded-xl mb-6">
            {(['login', 'register'] as Mode[]).map(m => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={[
                  'flex-1 py-2 text-sm rounded-lg transition-all font-medium',
                  mode === m ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-400',
                ].join(' ')}
              >
                {m === 'login' ? 'Iniciar sesión' : 'Registrarse'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === 'register' && (
              <input className="input" placeholder="Nombre completo" value={form.name} onChange={set('name')} required />
            )}
            <input className="input" type="email" placeholder="Correo electrónico" value={form.email} onChange={set('email')} required />
            <input className="input" type="password" placeholder="Contraseña (mín. 6 caracteres)" value={form.password} onChange={set('password')} required minLength={6} />
            {mode === 'register' && (
              <input className="input" placeholder="WhatsApp: +51999999999 (opcional)" value={form.whatsappNumber} onChange={set('whatsappNumber')} />
            )}
            <button type="submit" disabled={busy} className="btn-primary w-full mt-2 py-2.5">
              {busy ? 'Cargando...' : mode === 'login' ? 'Entrar' : 'Crear cuenta'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
