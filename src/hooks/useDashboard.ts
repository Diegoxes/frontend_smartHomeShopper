/** Resumen operativo: contadores y listas de alertas (stock bajo, por vencer) */
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { dashboardService } from '@/services/api'

export const DASHBOARD_KEY = ['dashboard'] as const

export function useDashboard() {
  return useQuery({
    queryKey: DASHBOARD_KEY,
    queryFn: dashboardService.get,
    staleTime: 30_000,
  })
}

export function useInvalidateDashboard() {
  const qc = useQueryClient()
  return () => {
    qc.invalidateQueries({ queryKey: DASHBOARD_KEY })
    qc.invalidateQueries({ queryKey: ['products'] })
  }
}
