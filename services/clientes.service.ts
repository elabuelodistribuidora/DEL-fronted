import { api } from '@/utils/api'
import type { Cliente } from '@/types/product'

export const clientesService = {
  list: (includeInactive = false) =>
    api.get<Cliente[]>(
      `/clientes${includeInactive ? '?includeInactive=true' : ''}`,
    ),

  // ── Admin ──
  create: (input: { name: string; logo?: string }) =>
    api.post<Cliente>('/clientes', input),

  update: (
    id: string,
    input: Partial<{ name: string; logo: string; active: boolean }>,
  ) => api.patch<Cliente>(`/clientes/${id}`, input),

  remove: (id: string) =>
    api.delete<{ deleted: boolean; unlinkedProducts: number }>(
      `/clientes/${id}`,
    ),
}
