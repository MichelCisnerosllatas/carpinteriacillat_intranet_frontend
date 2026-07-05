// src/features/products-services/data/data.ts
export const PRODUCT_SERVICE_TYPES = [
  { value: 'product', label: 'Producto' },
  { value: 'service', label: 'Servicio' },
] as const

export const getProductServiceTypeLabel = (type: string): string =>
  PRODUCT_SERVICE_TYPES.find((t) => t.value === type)?.label ?? type
