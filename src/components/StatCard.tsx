interface Props {
  label: string
  value: number | string
  color?: string
  icon?: string
}

export default function StatCard({ label, value, color = 'text-gray-800', icon }: Props) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">{label}</p>
        {icon && <span className="text-xl">{icon}</span>}
      </div>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
    </div>
  )
}
