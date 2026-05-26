import { useState } from 'react'
import { organizationService } from '@/services/api'
import { useAuth } from '@/context/AuthContext'
import toast from 'react-hot-toast'
import { LuBuilding2, LuBriefcase, LuDollarSign, LuGlobe, LuArrowRight, LuCheck } from 'react-icons/lu'

export default function OnboardingPage() {
  const { login } = useAuth()
  const [form, setForm] = useState({
    name: '',
    industry: 'General',
    currency: 'MXN',
    country: 'MX',
    timezone: 'America/Mexico_City',
  })
  const [busy, setBusy] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    try {
      const res = await organizationService.onboard(form)
      login(res)
      toast.success('¡Negocio configurado!')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
      toast.error(msg || 'No se pudo completar el onboarding')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 via-pearl to-white px-4 py-8">
      <div className="w-full max-w-2xl">
        
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-accent-500 flex items-center justify-center">
                <LuCheck className="w-5 h-5 text-white" />
              </div>
              <div className="ml-2">
                <p className="text-xs font-semibold text-slate-600">Paso 1</p>
                <p className="text-xs text-slate-500">Cuenta creada</p>
              </div>
            </div>
            <div className="h-0.5 w-16 bg-brand-200" />
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-brand-500 flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-sm">2</span>
              </div>
              <div className="ml-2">
                <p className="text-xs font-semibold text-brand-700">Paso 2</p>
                <p className="text-xs text-slate-500">Configuración</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card p-8 shadow-xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-100 to-brand-200 flex items-center justify-center mx-auto mb-4">
              <LuBuilding2 className="w-8 h-8 text-brand-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Configura tu organización</h1>
            <p className="text-sm text-slate-600">
              Un paso más para empezar a gestionar tu inventario de forma profesional
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1.5 flex items-center gap-1.5">
                <LuBuilding2 className="w-3.5 h-3.5" />
                Nombre de la organización *
              </label>
              <input 
                className="input text-base" 
                placeholder="Ej: Mi Empresa S.A."
                value={form.name} 
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))} 
                required 
                autoFocus
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1.5 flex items-center gap-1.5">
                <LuBriefcase className="w-3.5 h-3.5" />
                Rubro de tu negocio
              </label>
              <p className="text-xs text-slate-500 mb-2">
                Tipo de empresa (no categorías de productos). Usamos esto para sugerir categorías de inventario.
              </p>
              <input 
                className="input" 
                placeholder="Ej: Ferretería, Farmacia, Restaurante, Bodega"
                value={form.industry} 
                onChange={e => setForm(f => ({ ...f, industry: e.target.value }))} 
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5 flex items-center gap-1.5">
                  <LuDollarSign className="w-3.5 h-3.5" />
                  Moneda
                </label>
                <select 
                  className="input" 
                  value={form.currency} 
                  onChange={e => setForm(f => ({ ...f, currency: e.target.value }))}
                >
                  <option value="MXN">MXN - Peso mexicano</option>
                  <option value="USD">USD - Dólar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="PEN">PEN - Sol peruano</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5 flex items-center gap-1.5">
                  <LuGlobe className="w-3.5 h-3.5" />
                  País
                </label>
                <select 
                  className="input" 
                  value={form.country} 
                  onChange={e => setForm(f => ({ ...f, country: e.target.value }))}
                >
                  <option value="MX">México</option>
                  <option value="PE">Perú</option>
                  <option value="US">Estados Unidos</option>
                  <option value="CO">Colombia</option>
                  <option value="CL">Chile</option>
                </select>
              </div>
            </div>

            <div className="pt-4">
              <button type="submit" className="btn-primary w-full py-3 text-base" disabled={busy}>
                {busy ? 'Guardando...' : (
                  <>
                    Continuar al panel
                    <LuArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        <p className="text-center text-xs text-slate-500 mt-6">
          Podrás modificar esta información más adelante en la configuración
        </p>
      </div>
    </div>
  )
}
