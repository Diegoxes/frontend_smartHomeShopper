import { LuMessageSquare, LuCheck, LuCode, LuBot, LuSend } from 'react-icons/lu'

const STEPS = [
  'Entra a twilio.com y crea una cuenta gratuita (hay sandbox gratis).',
  'En el panel de Twilio, activa el sandbox de WhatsApp (Messaging → Try it out).',
  'Envía el código que te dan al número de Twilio desde tu WhatsApp.',
  'En tu servidor backend, configura el webhook apuntando a: POST /api/webhook/whatsapp',
  'Agrega tu número de WhatsApp en tu perfil dentro de la app.',
  '¡Listo! Empieza enviando "inventario" para probarlo.',
]

const COMMANDS = [
  { cmd: 'inventario',              desc: 'Ver todo tu stock actual' },
  { cmd: 'alertas',                 desc: 'Ver productos con stock bajo o por vencer' },
  { cmd: '-leche',                  desc: 'Restar 1 unidad de leche (rápido)' },
  { cmd: '-arroz 0.5',              desc: 'Restar 0.5 kg de arroz' },
  { cmd: '-5 leche',                desc: 'Restar 5 unidades de leche' },
  { cmd: '+10 leche',               desc: 'Sumar 10 unidades de leche' },
  { cmd: 'reporte',                 desc: 'Ver tipos de reporte Excel disponibles' },
  { cmd: 'reporte inventario',      desc: 'Recibir Excel con resumen y detalle de stock' },
  { cmd: 'reporte rotacion',        desc: 'Recibir Excel de consumo (30 días)' },
  { cmd: 'reporte completo',        desc: 'Recibir Excel con inventario y rotación' },
  { cmd: 'Compré 2 leches',         desc: 'Agregar stock con lenguaje natural (IA)' },
  { cmd: 'Gasté medio kilo de arroz', desc: 'Consumir con lenguaje natural (IA)' },
  { cmd: 'Tengo 3 jabones y 2L de aceite', desc: 'Agregar múltiples productos a la vez' },
]

export default function WhatsAppPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <LuMessageSquare className="w-8 h-8 text-green-500" />
          Integración WhatsApp
        </h1>
        <p className="text-sm text-slate-600 mt-1">Gestiona tu inventario desde mensajes de WhatsApp</p>
      </div>

      {/* how to connect */}
      <div className="card p-6 mb-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
            <LuCheck className="w-5 h-5 text-green-600" />
          </div>
          <h2 className="text-base font-bold text-gray-900">Cómo conectar tu WhatsApp</h2>
        </div>
        <div className="space-y-4">
          {STEPS.map((step, i) => (
            <div key={i} className="flex gap-4 p-3 bg-slate-50 rounded-lg">
              <div className="w-8 h-8 min-w-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-sm font-bold shrink-0">
                {i + 1}
              </div>
              <p className="text-sm text-slate-700 leading-relaxed pt-1">{step}</p>
            </div>
          ))}
        </div>
      </div>

      {/* commands */}
      <div className="card p-6 mb-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center">
            <LuBot className="w-5 h-5 text-brand-600" />
          </div>
          <h2 className="text-base font-bold text-gray-900">Comandos disponibles</h2>
        </div>
        <div className="space-y-3">
          {COMMANDS.map(({ cmd, desc }) => (
            <div key={cmd} className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
              <LuSend className="w-4 h-4 text-green-500 shrink-0 mt-1" />
              <div className="flex-1 min-w-0">
                <code className="block bg-white border border-slate-200 px-3 py-2 rounded-lg text-sm text-brand-700 font-mono mb-2">
                  {cmd}
                </code>
                <p className="text-sm text-slate-600">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* webhook info */}
      <div className="card p-6 bg-gradient-to-r from-brand-50 to-white border-brand-200">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-10 h-10 rounded-lg bg-brand-100 flex items-center justify-center">
            <LuCode className="w-5 h-5 text-brand-600" />
          </div>
          <h2 className="text-base font-bold text-gray-900">URL del webhook</h2>
        </div>
        <p className="text-sm text-slate-600 mb-3">Configura esta URL en tu panel de Twilio:</p>
        <code className="block text-sm text-brand-700 bg-white border border-brand-200 rounded-lg px-4 py-3 font-mono">
          POST https://tu-dominio.com/api/webhook/whatsapp
        </code>
        <p className="text-xs text-brand-600 mt-2">
          Configura esta URL en el panel de Twilio → WhatsApp Sandbox → When a message comes in
        </p>
      </div>
    </div>
  )
}
