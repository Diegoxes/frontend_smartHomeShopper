interface Props {
  label: string
  value: number | string
  color?: string
  bgGradient?: string
  icon?: React.ComponentType<{ className?: string }>
  subtext?: string
}

export default function StatCard({ 
  label, 
  value, 
  color = 'text-gray-900', 
  bgGradient = 'from-blue-50 to-blue-100',
  icon: Icon,
  subtext 
}: Props) {
  return (
    <div className="stat-widget group">
      <div className={`absolute inset-0 bg-gradient-to-br ${bgGradient} opacity-0 group-hover:opacity-100 transition-opacity rounded-xl`} />
      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">{label}</p>
            <p className={`text-3xl font-bold ${color} tabular-nums`}>{value}</p>
            {subtext && <p className="text-xs text-slate-500 mt-1">{subtext}</p>}
          </div>
          {Icon && (
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center shadow-sm">
              <Icon className="w-5 h-5 text-white" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
