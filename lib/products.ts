// Re-export de tipos de producto. Los datos vienen del backend
// (ver services/products.service.ts y hooks/useProducts.ts).
export type {
  Product,
  ProductFilters,
  Categoria,
  Marca,
  Paginated,
} from '@/types/product'
