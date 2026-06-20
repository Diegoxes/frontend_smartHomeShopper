/** Landing promocional estática (sin API). CTAs delegan en App → AuthPage. */
import {
  LuPackage,
  LuArrowRight,
  LuLayoutDashboard,
  LuBell,
  LuChartBar,
  LuShoppingCart,
  LuMessageSquare,
  LuCheck,
  LuTrendingUp,
  LuBoxes,
} from 'react-icons/lu'

interface Props {
  onStart: () => void
}

const FEATURES = [
  {
    icon: LuBoxes,
    title: 'Inventario y stock',
    desc: 'Catálogo centralizado, categorías, ajustes de entrada/salida y control por ubicación.',
  },
  {
    icon: LuLayoutDashboard,
    title: 'Dashboard y KPIs',
    desc: 'Vista ejecutiva con métricas clave, valor de stock y productos que requieren atención.',
  },
  {
    icon: LuBell,
    title: 'Alertas inteligentes',
    desc: 'Avisos de stock bajo y vencimientos para actuar antes de perder ventas.',
  },
  {
    icon: LuChartBar,
    title: 'Reportes y exportación',
    desc: 'Rotación, inventario valorizado y descargas para tu equipo financiero.',
  },
  {
    icon: LuShoppingCart,
    title: 'Compras y proveedores',
    desc: 'Órdenes de compra y proveedores vinculados al flujo de reposición.',
  },
  {
    icon: LuMessageSquare,
    title: 'WhatsApp y notificaciones',
    desc: 'Consulta stock por mensaje y mantén al equipo informado en tiempo real.',
  },
] as const

const STEPS = [
  { n: '01', title: 'Crea tu cuenta', desc: 'Regístrate con el correo de tu empresa en minutos.' },
  { n: '02', title: 'Configura tu organización', desc: 'Invita al equipo y define permisos por rol.' },
  { n: '03', title: 'Gestiona tu stock', desc: 'Carga productos, activa alertas y toma decisiones con datos.' },
] as const

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}

export default function LandingPage({ onStart }: Props) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50 via-pearl to-white text-gray-900">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-white/60 bg-white/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center shadow-sm shrink-0">
              <LuPackage className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-gray-900 truncate">SmartInventory</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <button type="button" onClick={() => scrollTo('features')} className="hover:text-brand-600 transition-colors">
              Características
            </button>
            <button type="button" onClick={() => scrollTo('como-funciona')} className="hover:text-brand-600 transition-colors">
              Cómo funciona
            </button>
          </nav>
          <div className="flex items-center gap-2 shrink-0">
            <button type="button" onClick={onStart} className="btn-secondary px-4 py-2 hidden sm:flex">
              Iniciar sesión
            </button>
            <button type="button" onClick={onStart} className="btn-primary px-4 py-2">
              Empezar
              <LuArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-brand-200/40 blur-3xl" />
          <div className="absolute bottom-0 -left-24 w-80 h-80 rounded-full bg-accent-100/50 blur-3xl" />
        </div>
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-20 lg:pt-24 lg:pb-28">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <p className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-100 text-brand-700 text-xs font-semibold mb-6">
                <LuTrendingUp className="w-3.5 h-3.5" />
                SaaS B2B para inventario
              </p>
              <h1 className="text-4xl sm:text-5xl lg:text-[3.25rem] font-bold leading-tight text-gray-900 tracking-tight">
                Controla tu stock con{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-brand-400">
                  claridad total
                </span>
              </h1>
              <p className="mt-6 text-lg text-slate-600 max-w-xl leading-relaxed">
                SmartInventory centraliza inventario, alertas, reportes y compras en una plataforma
                pensada para equipos que no pueden permitirse quedarse sin stock.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row gap-4">
                <button type="button" onClick={onStart} className="btn-primary px-8 py-3.5 text-base">
                  Empezar gratis
                  <LuArrowRight className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollTo('features')}
                  className="btn-secondary px-8 py-3.5 text-base"
                >
                  Ver características
                </button>
              </div>
              <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600">
                {['Sin tarjeta para empezar', 'Multi-usuario y roles', 'Alertas en tiempo real'].map(t => (
                  <li key={t} className="flex items-center gap-2">
                    <LuCheck className="w-4 h-4 text-accent-600 shrink-0" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>

            {/* Mock dashboard */}
            <div className="relative">
              <div className="card p-6 shadow-xl border-brand-100/80 bg-white/90 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-6">
                  <p className="text-sm font-semibold text-gray-900">Panel ejecutivo</p>
                  <span className="badge bg-accent-100 text-accent-700">En vivo</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Productos activos', value: '248', delta: '+12%' },
                    { label: 'Alertas activas', value: '7', delta: 'Revisar' },
                    { label: 'Valor en stock', value: 'S/ 84.2k', delta: '+5%' },
                    { label: 'Compras del mes', value: 'S/ 18.5k', delta: '3 pend.' },
                  ].map(k => (
                    <div key={k.label} className="rounded-xl bg-gradient-to-br from-brand-50 to-white border border-brand-100 p-4">
                      <p className="text-xs text-slate-500 font-medium">{k.label}</p>
                      <p className="text-xl font-bold text-gray-900 mt-1">{k.value}</p>
                      <p className="text-xs text-brand-600 mt-1 font-medium">{k.delta}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 rounded-xl border border-slate-200 p-4 space-y-3">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Stock crítico</p>
                  {['Cable HDMI 2m', 'Sensor PIR', 'Foco LED 12W'].map((name, i) => (
                    <div key={name} className="flex items-center justify-between text-sm">
                      <span className="text-gray-800">{name}</span>
                      <span className={i === 0 ? 'text-red-600 font-medium' : 'text-amber-600 font-medium'}>
                        {i === 0 ? '2 uds' : '5 uds'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-white border-y border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Todo lo que tu operación necesita</h2>
            <p className="mt-4 text-slate-600">
              Módulos integrados para que ventas, almacén y gerencia trabajen sobre los mismos datos.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(f => (
              <article key={f.title} className="card p-6 hover:border-brand-200 transition-colors group">
                <div className="w-12 h-12 rounded-xl bg-brand-100 flex items-center justify-center mb-4 group-hover:bg-brand-200 transition-colors">
                  <f.icon className="w-6 h-6 text-brand-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">{f.title}</h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">{f.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="como-funciona" className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Empieza en tres pasos</h2>
            <p className="mt-4 text-slate-600">De la cuenta nueva al control de inventario en el mismo día.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {STEPS.map(s => (
              <div key={s.n} className="relative text-center md:text-left">
                <span className="text-5xl font-black text-brand-100 leading-none">{s.n}</span>
                <h3 className="text-xl font-bold text-gray-900 mt-2">{s.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto rounded-2xl bg-gradient-to-br from-brand-600 to-brand-700 p-10 sm:p-14 text-center text-white shadow-xl shadow-brand-200">
          <h2 className="text-2xl sm:text-3xl font-bold">¿Listo para ordenar tu inventario?</h2>
          <p className="mt-4 text-brand-100 max-w-lg mx-auto">
            Crea tu cuenta y configura tu organización. Tu equipo tendrá visibilidad desde el primer día.
          </p>
          <button
            type="button"
            onClick={onStart}
            className="mt-8 inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-white text-brand-700 font-semibold rounded-lg hover:bg-brand-50 transition-all shadow-md"
          >
            Empieza gratis
            <LuArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-10 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
              <LuPackage className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-gray-800">SmartInventory</span>
          </div>
          <p>© {new Date().getFullYear()} SmartInventory. Todos los derechos reservados.</p>
          <p className="text-xs">
            <span className="hover:text-brand-600 cursor-default">Términos</span>
            {' · '}
            <span className="hover:text-brand-600 cursor-default">Privacidad</span>
          </p>
        </div>
      </footer>
    </div>
  )
}
