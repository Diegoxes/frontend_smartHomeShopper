/** Reportes analíticos + exportación XLSX vía blob download */
import { useQuery } from '@tanstack/react-query'
import { reportService } from '@/services/api'
import StatCard from '@/components/StatCard'
import { 
  LuChartBar, 
  LuDownload, 
  LuPackage, 
  LuDollarSign, 
  LuActivity, 
  LuPause,
  LuTag,
  LuTrendingUp 
} from 'react-icons/lu'

export default function StatsPage() {
  const { data: inv, isLoading } = useQuery({ queryKey: ['report-inventory'], queryFn: () => reportService.inventory() })
  const { data: rotation } = useQuery({ queryKey: ['report-rotation'], queryFn: () => reportService.rotation() })

  // Descarga del archivo generado en el backend (responseType: blob en api.ts)
  const exportReport = async () => {
    const blob = await reportService.exportXlsx()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'reporte-inventario.xlsx'
    a.click()
    URL.revokeObjectURL(url)
  }

  if (isLoading) return (
    <div className="flex items-center justify-center py-20">
      <div className="text-center">
        <div className="w-12 h-12 rounded-full border-4 border-brand-200 border-t-brand-600 animate-spin mx-auto mb-4" />
        <p className="text-sm text-slate-500">Cargando reportes...</p>
      </div>
    </div>
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <LuChartBar className="w-8 h-8 text-brand-500" />
            Reportes
          </h1>
          <p className="text-sm text-slate-600 mt-1">Análisis y métricas de inventario</p>
        </div>
        <button type="button" className="btn-secondary" onClick={exportReport}>
          <LuDownload className="w-4 h-4" />
          Exportar XLSX
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          label="Total SKU" 
          value={inv?.totalSku ?? 0} 
          icon={LuPackage}
          bgGradient="from-blue-50 to-blue-100"
        />
        <StatCard 
          label="Valor inventario" 
          value={`$${inv?.totalEstimatedValue?.toFixed(0) ?? 0}`} 
          icon={LuDollarSign}
          bgGradient="from-accent-50 to-accent-100"
          color="text-accent-700"
        />
        <StatCard 
          label="En rotación" 
          value={rotation?.rows?.length ?? 0} 
          icon={LuActivity}
          bgGradient="from-brand-50 to-brand-100"
          color="text-brand-700"
        />
        <StatCard 
          label="Sin movimiento" 
          value={inv?.stagnantProductIds?.length ?? 0} 
          icon={LuPause}
          bgGradient="from-slate-50 to-slate-100"
          color="text-slate-700"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center">
              <LuTag className="w-5 h-5 text-brand-600" />
            </div>
            <h2 className="text-base font-bold text-gray-900">Por categoría</h2>
          </div>
          <div className="space-y-3">
            {(inv?.byCategory ?? []).length > 0 ? (
              (inv?.byCategory ?? []).map(c => (
                <div key={c.category} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                  <span className="font-medium text-gray-900">{c.category}</span>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-700">{c.skuCount} SKU</p>
                    <p className="text-xs text-slate-500">${c.estimatedSpend?.toFixed(0)}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500 text-center py-8">Sin datos de categorías</p>
            )}
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-10 h-10 rounded-lg bg-accent-50 flex items-center justify-center">
              <LuTrendingUp className="w-5 h-5 text-accent-600" />
            </div>
            <h2 className="text-base font-bold text-gray-900">Rotación (30 días)</h2>
          </div>
          <div className="space-y-3">
            {(rotation?.rows ?? []).length > 0 ? (
              (rotation?.rows ?? []).slice(0, 10).map((r, idx) => (
                <div key={r.productId} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-brand-700">{idx + 1}</span>
                    </div>
                    <span className="font-medium text-gray-900 truncate">{r.productName}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-700">{r.unitsConsumed} u</p>
                    <p className="text-xs text-slate-500">{r.velocity}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500 text-center py-8">Sin datos de rotación</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
