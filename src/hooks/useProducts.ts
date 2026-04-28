import { useMutation } from '@tanstack/react-query'
import { productService } from '@/services/api'
import { useInvalidateDashboard } from './useDashboard'
import toast from 'react-hot-toast'
import type { CreateProductRequest, UpdateProductRequest, AdjustRequest } from '@/types'

export function useCreateProduct() {
  const invalidate = useInvalidateDashboard()
  return useMutation({
    mutationFn: (data: CreateProductRequest) => productService.create(data),
    onSuccess: () => { toast.success('Producto agregado'); invalidate() },
    onError:   () => toast.error('Error al guardar'),
  })
}

export function useUpdateProduct() {
  const invalidate = useInvalidateDashboard()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProductRequest }) => productService.update(id, data),
    onSuccess: () => { toast.success('Producto actualizado'); invalidate() },
    onError:   () => toast.error('Error al actualizar'),
  })
}

export function useDeleteProduct() {
  const invalidate = useInvalidateDashboard()
  return useMutation({
    mutationFn: (id: string) => productService.delete(id),
    onSuccess: () => { toast.success('Producto eliminado'); invalidate() },
    onError:   () => toast.error('Error al eliminar'),
  })
}

export function useConsumeProduct() {
  const invalidate = useInvalidateDashboard()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AdjustRequest }) => productService.consume(id, data),
    onSuccess: () => { toast.success('Consumo registrado'); invalidate() },
    onError:   () => toast.error('Error al registrar'),
  })
}

export function useRestockProduct() {
  const invalidate = useInvalidateDashboard()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AdjustRequest }) => productService.restock(id, data),
    onSuccess: () => { toast.success('Stock repuesto'); invalidate() },
    onError:   () => toast.error('Error al reponer'),
  })
}
