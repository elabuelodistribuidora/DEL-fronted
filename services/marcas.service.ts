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

  remove: (id: string) =>
    api.delete<{ deleted: boolean; unlinkedProducts: number }>(
      `/marcas/${id}`,
    ),
}
