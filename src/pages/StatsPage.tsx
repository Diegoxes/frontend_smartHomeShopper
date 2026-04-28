import { useDashboard } from '@/hooks/useDashboard'
import StatCard from '@/components/StatCard'
import { CATEGORIES } from '@/types'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts'

const COLORS = ['#4ade80','#60a5fa','#f59e0b','#f87171','#a78bfa','#34d399','#fb923c','#38bdf8']

export default function StatsPage() {
  const { data, isLoading } = useDashboard()

  if (isLoading) return <p className="text-sm text-gray-400 pt-4">Cargando...</p>

  const products = data?.allProducts ?? []

  const catData = CATEGORIES
    .map(name => ({ name, count: products.filter(p => p.category === name).length }))
    .filter(d => d.count > 0)

  const prediction = products
    .filter(p => p.daysUntilEmpty != null)
    .sort((a, b) => (a.daysUntilEmpty ?? 999) - (b.daysUntilEmpty ?? 999))
    .slice(0, 8)

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Estadísticas 📊</h1>

      {/* stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total"          value={data?.totalProducts ?? 0} icon="📦" />
        <StatCard label="Stock bajo"     value={data?.lowStockCount ?? 0}  icon="⚠️" color="text-red-500" />
        <StatCard label="Por vencer"     value={data?.expiringCount ?? 0}  icon="📅" color="text-amber-500" />
        <StatCard label="Categorías"     value={catData.length}            icon="🏷️" />
      </div>

      {/* bar chart */}
      {catData.length > 0 && (
        <div className="card p-5 mb-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Productos por categoría</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={catData} margin={{ top: 0, right: 0, left: -30, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
              />
              <Bar dataKey="count" name="Productos" radius={[4, 4, 0, 0]}>
                {catData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* prediction table */}
      <div className="card p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Predicción de agotamiento</h2>
        {prediction.length === 0
          ? <p className="text-sm text-gray-300">Necesitas más historial de consumo para calcular predicciones.</p>
          : (
            <div className="divide-y divide-gray-50">
              {prediction.map(p => {
                const days = Math.round(p.daysUntilEmpty!)
                const color = days < 3 ? 'bg-red-50 text-red-500'
                            : days < 7 ? 'bg-amber-50 text-amber-600'
                            : 'bg-brand-50 text-brand-700'
                return (
                  <div key={p.id} className="flex items-center justify-between py-2.5">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{p.name}</p>
                      <p className="text-xs text-gray-400">{p.category || 'Sin categoría'}</p>
                    </div>
                    <span className={`badge ${color}`}>~{days} días</span>
                  </div>
                )
              })}
            </div>
          )
        }
      </div>
    </div>
  )
}
