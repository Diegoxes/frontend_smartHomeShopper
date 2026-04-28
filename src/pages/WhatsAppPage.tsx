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
  { cmd: 'Compré 2 leches',         desc: 'Agregar stock con lenguaje natural (IA)' },
  { cmd: 'Gasté medio kilo de arroz', desc: 'Consumir con lenguaje natural (IA)' },
  { cmd: 'Tengo 3 jabones y 2L de aceite', desc: 'Agregar múltiples productos a la vez' },
]

export default function WhatsAppPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Integración WhatsApp 💬</h1>

      {/* how to connect */}
      <div className="card p-5 mb-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Cómo conectar tu WhatsApp</h2>
        <div className="space-y-3">
          {STEPS.map((step, i) => (
            <div key={i} className="flex gap-3">
              <div className="w-6 h-6 min-w-6 rounded-full bg-brand-50 text-brand-700 flex items-center justify-center text-xs font-bold shrink-0">
                {i + 1}
              </div>
              <p className="text-sm text-gray-500 leading-relaxed">{step}</p>
            </div>
          ))}
        </div>
      </div>

      {/* commands */}
      <div className="card p-5 mb-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Comandos disponibles</h2>
        <div className="space-y-3">
          {COMMANDS.map(({ cmd, desc }) => (
            <div key={cmd} className="flex items-start gap-3">
              <code className="bg-gray-50 border border-gray-200 px-3 py-1 rounded-lg text-xs text-brand-700 font-mono whitespace-nowrap shrink-0">
                {cmd}
              </code>
              <p className="text-sm text-gray-400 leading-relaxed pt-0.5">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* webhook info */}
      <div className="card p-5 bg-brand-50 border-brand-100">
        <h2 className="text-sm font-semibold text-brand-700 mb-2">URL del webhook</h2>
        <code className="block text-xs text-brand-600 bg-white border border-brand-100 rounded-lg px-4 py-3 font-mono">
          POST https://tu-dominio.com/api/webhook/whatsapp
        </code>
        <p className="text-xs text-brand-600 mt-2">
          Configura esta URL en el panel de Twilio → WhatsApp Sandbox → When a message comes in
        </p>
      </div>
    </div>
  )
}
