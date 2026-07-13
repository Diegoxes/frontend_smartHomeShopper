/** Pantalla de login/registro. Tras auth exitosa, AuthContext persiste el JWT y App redirige. */
import { useState, useEffect } from 'react'
import { authService } from '@/services/api'
import { useAuth } from '@/context/AuthContext'
import toast from 'react-hot-toast'
import { LuMail, LuLock, LuUser, LuPhone, LuPackage, LuArrowRight, LuBell } from 'react-icons/lu'

type Mode = 'login' | 'register'

interface Props {
  onBack?: () => void
}

export default function AuthPage({ onBack }: Props) {
  const { login } = useAuth()
  const [mode, setMode] = useState<Mode>('login')
  const [form, setForm] = useState({ email: '', password: '', name: '', whatsappNumber: '' })
  const [busy, setBusy] = useState(false)
  const [maintenanceOn, setMaintenanceOn] = useState(false)

  // Consulta pública (sin JWT) para mostrar aviso antes de intentar login
  useEffect(() => {
    authService
      .maintenanceStatus()
      .then(s => setMaintenanceOn(s.enabled))
      .catch(() => {})
  }, [])

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const validateForm = () => {
    const emailRegex = /^[A-Za-z][A-Za-z0-9._%+-]*@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

    if (!emailRegex.test(form.email)) {
      toast.error('El correo debe comenzar con una letra y tener un formato válido XD.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    //if (!validateForm()) return;

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 via-pearl to-white px-4 py-8">
      <div className="w-full max-w-md">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="mb-6 text-sm text-slate-500 hover:text-brand-600 transition-colors"
          >
            ← Volver al inicio
          </button>
        )}

        {/* logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-brand-200">
            <LuPackage className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">SmartInventory</h1>
          <p className="text-sm text-slate-600 mt-2">Gestión inteligente de stock para empresas B2B</p>
        </div>

        {maintenanceOn && (
          <div className="mb-6 rounded-xl border border-amber-300 bg-amber-50 px-5 py-4 text-sm text-amber-900 shadow-sm">
            <div className="flex items-start gap-3">
              <LuBell className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold">Mantenimiento activo</strong>
                <p className="mt-1 text-amber-800">Solo la cuenta administrador de plataforma puede usar la aplicación en este momento.</p>
              </div>
            </div>
          </div>
        )}

        <div className="card p-8 shadow-xl">
          {/* tabs */}
          <div className="flex p-1.5 bg-slate-100 rounded-xl mb-8">
            {(['login', 'register'] as Mode[]).map(m => (
              <button
                key={m}
                type="button"
                data-testid={m === 'login' ? 'tab-login' : 'tab-register'}
                aria-selected={mode === m}
                onClick={() => setMode(m)}
                className={[
                  'flex-1 py-2.5 text-sm rounded-lg transition-all font-semibold',
                  mode === m ? 'bg-white text-gray-900 shadow-md' : 'text-slate-500 hover:text-slate-700',
                ].join(' ')}
              >
                {m === 'login' ? 'Iniciar sesión' : 'Registrarse'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" data-testid="auth-form">
            {mode === 'register' && (
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">Nombre completo</label>
                <div className="relative">
                  <LuUser className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    className="input pl-10" 
                    placeholder="Juan Pérez" 
                    value={form.name} 
                    onChange={set('name')} 
                    required 
                  />
                </div>
              </div>
            )}
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">Correo electrónico</label>
              <div className="relative">
                <LuMail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  className="input pl-10" 
                  type="email" 
                  placeholder="tu@empresa.com" 
                  value={form.email} 
                  onChange={set('email')} 
                  required 
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">Contraseña</label>
              <div className="relative">
                <LuLock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  className="input pl-10" 
                  type="password" 
                  placeholder="Mínimo 6 caracteres" 
                  value={form.password} 
                  onChange={set('password')} 
                  required 
                  minLength={6} 
                />
              </div>
            </div>
            {mode === 'register' && (
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">WhatsApp (opcional)</label>
                <div className="relative">
                  <LuPhone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    className="input pl-10" 
                    placeholder="+51999999999" 
                    value={form.whatsappNumber} 
                    onChange={set('whatsappNumber')} 
                  />
                </div>
              </div>
            )}
            <button
              type="submit"
              disabled={busy}
              data-testid={mode === 'login' ? 'btn-login' : 'btn-register'}
              className="btn-primary w-full mt-6 py-3 text-base"
            >
              {busy ? 'Cargando...' : mode === 'login' ? (
                <>
                  Entrar
                  <LuArrowRight className="w-5 h-5" />
                </>
              ) : 'Crear cuenta'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-500 mt-6">
          Al continuar, aceptas nuestros términos de servicio y política de privacidad
        </p>
      </div>
    </div>
  )
}
