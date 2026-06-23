/**
 * Pantalla para managers cuya organización está PENDING o REJECTED.
 * No pueden operar el inventario hasta que el PLATFORM_OWNER apruebe.
 */
import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import toast from 'react-hot-toast'
import { LuClock, LuXCircle, LuRefreshCw, LuLogOut } from 'react-icons/lu'

export default function PendingApprovalPage() {
  const { user, logout, refreshUser } = useAuth()
  const [checking, setChecking] = useState(false)
  const rejected = user?.orgStatus === 'REJECTED'

  const handleRefresh = async () => {
    setChecking(true)
    try {
      await refreshUser()
      toast.success('Estado actualizado')
    } catch {
      toast.error('No se pudo verificar el estado')
    } finally {
      setChecking(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-brand-50 via-pearl to-white px-6 text-center">
      <div className="w-full max-w-md">
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 ${
          rejected ? 'bg-red-100' : 'bg-amber-100'
        }`}>
          {rejected
            ? <LuXCircle className="w-8 h-8 text-red-600" />
            : <LuClock className="w-8 h-8 text-amber-600" />
          }
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          {rejected ? 'Solicitud rechazada' : 'Esperando aprobación'}
        </h1>

        <p className="text-sm text-slate-600 mb-8 leading-relaxed">
          {rejected
            ? 'El administrador de la plataforma no aprobó tu solicitud para crear una organización. Contacta al soporte si crees que es un error.'
            : 'Tu solicitud para administrar una organización fue enviada al administrador de la plataforma. Recibirás acceso al panel cuando sea aprobada.'
          }
        </p>

        {!rejected && (
          <button
            type="button"
            className="btn-primary w-full mb-3 flex items-center justify-center gap-2"
            onClick={handleRefresh}
            disabled={checking}
          >
            <LuRefreshCw className={`w-4 h-4 ${checking ? 'animate-spin' : ''}`} />
            {checking ? 'Verificando...' : 'Revisar estado'}
          </button>
        )}

        <button
          type="button"
          className="btn-secondary w-full flex items-center justify-center gap-2"
          onClick={logout}
        >
          <LuLogOut className="w-4 h-4" />
          Cerrar sesión
        </button>
      </div>
    </div>
  )
}
