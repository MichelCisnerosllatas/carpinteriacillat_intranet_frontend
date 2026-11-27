// src/features/sales/ui/pos/product-search-field.tsx
'use client'

import { useEffect, useMemo, useState, type RefObject } from 'react'
import { Plus, Search } from 'lucide-react'
import { Badge } from '@/shared/ui/badge'
import { IconButton } from '@/shared/ui/icon-button'
import { Label } from '@/shared/ui/label'
import {
  ProductServicePickerModal,
  getProductServiceTypeLabel,
  useProductServiceSelectStore,
  type ProductServiceJoinApiItem,
} from '@/features/products-services'
import { AutocompleteInput } from './autocomplete-input'
import type { ProductToAdd } from '../../lib/sale-pos'

const MAX_RESULTS = 8

interface ProductSearchFieldProps {
  inputRef: RefObject<HTMLInputElement | null>
  modalOpen: boolean
  onModalOpenChange: (open: boolean) => void
  onAdd: (product: ProductToAdd) => void
  onAddFreeLine: () => void
  disabled?: boolean
}

/**
 * Buscador de productos/servicios: se escribe, Enter agrega con cantidad 1 y el foco se queda
 * aquí para seguir con el siguiente (flujo de caja). La lupa abre el catálogo completo.
 */
export function ProductSearchField({
  inputRef,
  modalOpen,
  onModalOpenChange,
  onAdd,
  onAddFreeLine,
  disabled,
}: ProductSearchFieldProps) {
  const { options, load } = useProductServiceSelectStore()
  const [query, setQuery] = useState('')

  useEffect(() => {
    void load()
  }, [])

  const items = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term) return []
    return options.filter((o) => o.name.toLowerCase().includes(term)).slice(0, MAX_RESULTS)
  }, [options, query])

  const handlePick = (product: ProductServiceJoinApiItem) => {
    onAdd(product)
    setQuery('')
  }

  const handleModalPick = (product: ProductToAdd) => {
    onAdd(product)
    // Al cerrar, el Dialog devuelve el foco a la lupa; se espera un instante y se manda al
    // buscador para que el cajero siga tecleando el siguiente producto.
    window.setTimeout(() => inputRef.current?.focus(), 50)
  }

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor="pos-product">
        Producto o servicio <span className="text-muted-foreground text-xs font-normal">(F2)</span>
      </Label>
      <div className="flex gap-2">
        <AutocompleteInput<ProductServiceJoinApiItem>
          id="pos-product"
          inputRef={inputRef}
          query={query}
          onQueryChange={setQuery}
          items={items}
          getKey={(p) => p.id}
          renderItem={(p) => (
            <span className="flex items-center justify-between gap-3">
              <span className="flex min-w-0 flex-col">
                <span className="truncate font-medium">{p.name}</span>
                <span className="text-muted-foreground text-xs">
                  {p.unit ?? 'Sin unidad'}
                </span>
              </span>
              <span className="flex shrink-0 items-center gap-2">
                <Badge variant="secondary" className="text-[10px] font-normal">
                  {getProductServiceTypeLabel(p.type)}
                </Badge>
                <span className="tabular-nums">S/ {Number(p.default_price).toFixed(2)}</span>
              </span>
            </span>
          )}
          onPick={handlePick}
          placeholder="Escribe para buscar y pulsa Enter para agregar..."
          emptyText="Sin resultados. Usa la lupa o agrega un ítem libre."
          disabled={disabled}
        />
        <IconButton
          label="Buscar en el catálogo"
          className="shrink-0"
          disabled={disabled}
          onClick={() => onModalOpenChange(true)}
          icon={<Search />}
        />
        <IconButton
          label="Agregar ítem libre (sin producto del catálogo)"
          className="shrink-0"
          disabled={disabled}
          onClick={onAddFreeLine}
          icon={<Plus />}
        />
      </div>

      <ProductServicePickerModal
        open={modalOpen}
        onOpenChange={onModalOpenChange}
        showTypeTabs
        onSelect={handleModalPick}
      />
    </div>
  )
}
