// Re-export de tipos de producto. Los datos ahora vienen del backend
// (ver services/products.service.ts y hooks/useProducts.ts).
export type {
  Product,
  ProductFilters,
  Categoria,
  Cliente,
  ProductVariant,
  Paginated,
} from '@/types/product'
