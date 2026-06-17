import { api } from '@/utils/api'
import type { Marca } from '@/types/product'

export const marcasService = {
  list: (includeInactive = false) =>
    api.get<Marca[]>(
      `/marcas${includeInactive ? '?includeInactive=true' : ''}`,
    ),

  // ── Admin ──
  create: (input: { name: string; logo?: string }) =>
    api.post<Marca>('/marcas', input),

  update: (
    id: string,
    input: Partial<{ name: string; logo: string; active: boolean }>,
  ) => api.patch<Marca>(`/marcas/${id}`, input),

  /** Si la marca tiene productos, pasar reassignTo con el id de la marca destino. */
  remove: (id: string, reassignTo?: string) =>
    api.delete<{ deleted: boolean; reassigned?: number }>(
      `/marcas/${id}${reassignTo ? `?reassignTo=${reassignTo}` : ''}`,
    ),
}
