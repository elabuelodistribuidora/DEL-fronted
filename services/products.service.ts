import { api } from '@/utils/api'
import type {
  Paginated,
  Product,
  ProductFilters,
} from '@/types/product'

/** Construye la query string a partir de los filtros (omite vacíos). */
function buildQuery(filters: ProductFilters = {}): string {
  const params = new URLSearchParams()
  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return
    params.set(key, String(value))
  })
  const qs = params.toString()
  return qs ? `?${qs}` : ''
}

export type ProductInput = {
  name: string
  description?: string
  brand: string
  unit: string
  sku?: string
  price: number
  stock?: number
  image?: string
  images?: string[]
  tags?: string[]
  featured?: boolean
  active?: boolean
  categoriaId: string
  clienteId?: string | null
}

export const productsService = {
  list: (filters?: ProductFilters) =>
    api.get<Paginated<Product>>(`/products${buildQuery(filters)}`),

  getOne: (idOrSlug: string) => api.get<Product>(`/products/${idOrSlug}`),

  // ── Admin ──
  create: (input: ProductInput) => api.post<Product>('/products', input),

  update: (id: string, input: Partial<ProductInput>) =>
    api.patch<Product>(`/products/${id}`, input),

  remove: (id: string) => api.delete<{ deleted: boolean }>(`/products/${id}`),
}
