import { api } from '@/utils/api'
import { getAuthToken } from '@/store/authStore'
import type { Paginated, Product, ProductFilters } from '@/types/product'

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

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
  sku?: string
  price: number
  inStock?: boolean
  hidden?: boolean
  image?: string
  images?: string[]
  tags?: string[]
  featured?: boolean
  onSale?: boolean
  salePrice?: number
  exclusive?: boolean
  active?: boolean
  categoriaId: string
  marcaId?: string | null
}

export type ImportRowError = { row: number; code?: string; message: string }

export type ImportResult = {
  applied: boolean
  totalRows: number
  created: number
  deleted: number
  skipped: number
  errorCount: number
  errors: ImportRowError[]
  marcasCreadas: string[]
  categoriasCreadas: string[]
}

export const productsService = {
  list: (filters?: ProductFilters) =>
    api.get<Paginated<Product>>(`/products${buildQuery(filters)}`),

  getOne: (idOrSlug: string) => api.get<Product>(`/products/${idOrSlug}`),

  /** Productos relacionados (misma marca/categoría). */
  getRelated: (idOrSlug: string) =>
    api.get<Product[]>(`/products/${idOrSlug}/related`),

  /** Info de la lista de precios (Excel) para descargar. */
  priceList: () =>
    api.get<{ available: boolean; url: string | null }>('/products/price-list'),

  // ── Admin ──
  create: (input: ProductInput) => api.post<Product>('/products', input),

  update: (id: string, input: Partial<ProductInput>) =>
    api.patch<Product>(`/products/${id}`, input),

  /** Borrado lógico (lo marca inactivo, se puede reactivar). */
  remove: (id: string) => api.delete<{ deleted: boolean }>(`/products/${id}`),

  /** Borrado permanente. */
  hardDelete: (id: string) =>
    api.delete<{ deleted: boolean }>(`/products/${id}/hard`),

  /** Importa productos desde un archivo Excel (multipart). */
  async importExcel(file: File): Promise<ImportResult> {
    const form = new FormData()
    form.append('file', file)
    const res = await fetch(`${API_BASE}/products/import`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${getAuthToken() ?? ''}` },
      body: form,
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText }))
      throw new Error(err.message ?? 'Error al importar')
    }
    return res.json() as Promise<ImportResult>
  },
}
