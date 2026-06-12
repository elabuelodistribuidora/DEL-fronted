/**
 * Categoría (rubro) — modelo relacional del backend.
 * El admin las administra; el front las usa en filtros y selects.
 */
export type Categoria = {
  id: string
  name: string
  slug: string
  description?: string | null
  active?: boolean
  _count?: { products: number }
}

/**
 * Cliente = proveedor oficial del producto (etiqueta: nombre + logo).
 * NO es el comprador.
 */
export type Cliente = {
  id: string
  name: string
  slug: string
  logo?: string | null
  logoUrl?: string | null
  active?: boolean
  _count?: { products: number }
}

export type ProductVariant = {
  id: string
  productId: string
  name: string
  sku?: string | null
  stock: number
  price?: number | null
  attributes: Record<string, string>
}

/**
 * Producto tal como lo serializa el backend (`/products`).
 * `price` es el precio mayorista (number). Las imágenes vienen como key de S3
 * (`image`) y como URL pública ya resuelta (`imageUrl`).
 */
export type Product = {
  id: string
  name: string
  slug: string
  description?: string | null
  brand: string
  unit: string
  sku?: string | null
  price: number
  stock: number
  image?: string | null
  imageUrl?: string | null
  images?: string[]
  imagesUrls?: (string | null)[]
  tags?: string[]
  featured?: boolean
  active?: boolean
  categoriaId: string
  clienteId?: string | null
  categoria?: Pick<Categoria, 'id' | 'name' | 'slug'> | null
  cliente?:
    | (Pick<Cliente, 'id' | 'name' | 'slug'> & { logoUrl?: string | null })
    | null
  variants?: ProductVariant[]
  createdAt?: string
  updatedAt?: string
}

/** Filtros que acepta `GET /products`. */
export type ProductFilters = {
  search?: string
  categoria?: string // slug de categoría
  cliente?: string // slug de proveedor
  brand?: string
  featured?: boolean
  minPrice?: number
  maxPrice?: number
  includeInactive?: boolean
  sort?: 'recent' | 'name' | 'price_asc' | 'price_desc'
  page?: number
  limit?: number
}

/** Respuesta paginada estándar del backend. */
export type Paginated<T> = {
  data: T[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}
