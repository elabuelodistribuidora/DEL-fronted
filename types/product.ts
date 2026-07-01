/**
 * Categoría (rubro) — modelo relacional del backend.
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
 * Marca (antes "proveedor") — etiqueta del producto: nombre + logo.
 */
export type Marca = {
  id: string
  name: string
  slug: string
  logo?: string | null
  logoUrl?: string | null
  active?: boolean
  _count?: { products: number }
}

/**
 * Modelo/variante de un producto: mismo código, distinto diseño.
 * Solo nombre + imagen (sin precio ni stock propios).
 */
export type ProductVariant = {
  name: string
  image?: string | null
  imageUrl?: string | null
}

/**
 * Producto tal como lo serializa el backend (`/products`).
 */
export type Product = {
  id: string
  name: string
  slug: string
  description?: string | null
  sku?: string | null
  price: number
  priceUpdatedAt?: string | null
  inStock: boolean
  hidden?: boolean
  image?: string | null
  imageUrl?: string | null
  images?: string[]
  imagesUrls?: (string | null)[]
  tags?: string[]
  featured?: boolean
  onSale?: boolean
  salePrice?: number | null
  exclusive?: boolean
  hasVariants?: boolean
  variants?: ProductVariant[]
  active?: boolean
  categoriaId: string
  marcaId?: string | null
  categoria?: Pick<Categoria, 'id' | 'name' | 'slug'> | null
  marca?:
    | (Pick<Marca, 'id' | 'name' | 'slug'> & { logoUrl?: string | null })
    | null
  createdAt?: string
  updatedAt?: string
}

/** Filtros que acepta `GET /products`. */
export type ProductFilters = {
  search?: string
  categoria?: string // slug de categoría
  marca?: string // slug de marca
  featured?: boolean
  onSale?: boolean
  inStock?: boolean
  minPrice?: number
  maxPrice?: number
  includeInactive?: boolean
  includeHidden?: boolean
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
