import { api } from '@/utils/api'
import type { Categoria } from '@/types/product'

export const categoriasService = {
  list: (includeInactive = false) =>
    api.get<Categoria[]>(
      `/categorias${includeInactive ? '?includeInactive=true' : ''}`,
    ),

  // ── Admin ──
  create: (input: { name: string; description?: string }) =>
    api.post<Categoria>('/categorias', input),

  update: (id: string, input: Partial<{ name: string; description: string; active: boolean }>) =>
    api.patch<Categoria>(`/categorias/${id}`, input),

  /** Si la categoría tiene productos, pasar reassignTo con el id destino. */
  remove: (id: string, reassignTo?: string) =>
    api.delete<{ deleted: boolean; reassigned: number }>(
      `/categorias/${id}${reassignTo ? `?reassignTo=${reassignTo}` : ''}`,
    ),
}
