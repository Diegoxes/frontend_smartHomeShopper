import { useMutation, useQueryClient } from '@tanstack/react-query'
import { productService } from '@/services/api'
import { DASHBOARD_KEY } from './useDashboard'
import toast from 'react-hot-toast'
import type { CreateProductRequest, UpdateProductRequest, AdjustRequest, Product } from '@/types'

export const PRODUCTS_KEY = ['products'] as const

function upsertProductInList(list: Product[], item: Product): Product[] {
  const idx = list.findIndex(p => p.id === item.id)
  if (idx >= 0) {
    const next = [...list]
    next[idx] = item
    return next
  }
  return [...list, item]
}

export function syncProductQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  product?: Product,
  removedId?: string,
) {
  if (product) {
    queryClient.setQueriesData<Product[]>({ queryKey: PRODUCTS_KEY }, old =>
      old ? upsertProductInList(old, product) : [product],
    )
  }
  if (removedId) {
    queryClient.setQueriesData<Product[]>({ queryKey: PRODUCTS_KEY }, old =>
      old ? old.filter(p => p.id !== removedId) : old,
    )
  }
  return Promise.all([
    queryClient.refetchQueries({ queryKey: PRODUCTS_KEY, type: 'all' }),
    queryClient.invalidateQueries({ queryKey: DASHBOARD_KEY }),
    queryClient.invalidateQueries({ queryKey: ['executive'] }),
  ])
}

export function useCreateProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateProductRequest) => productService.create(data),
    onSuccess: async (product) => {
      toast.success('Producto agregado')
      await syncProductQueries(queryClient, product)
    },
    onError: () => toast.error('Error al guardar'),
  })
}

export function useUpdateProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProductRequest }) => productService.update(id, data),
    onSuccess: async (product) => {
      toast.success('Producto actualizado')
      await syncProductQueries(queryClient, product)
    },
    onError: () => toast.error('Error al actualizar'),
  })
}

export function useDeleteProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => productService.delete(id),
    onSuccess: async (_, id) => {
      toast.success('Producto eliminado')
      await syncProductQueries(queryClient, undefined, id)
    },
    onError: () => toast.error('Error al eliminar'),
  })
}

export function useConsumeProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AdjustRequest }) => productService.consume(id, data),
    onSuccess: async (product) => {
      toast.success('Consumo registrado')
      await syncProductQueries(queryClient, product)
    },
    onError: () => toast.error('Error al registrar'),
  })
}

export function useRestockProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AdjustRequest }) => productService.restock(id, data),
    onSuccess: async (product) => {
      toast.success('Stock repuesto')
      await syncProductQueries(queryClient, product)
    },
    onError: () => toast.error('Error al reponer'),
  })
}
