'use client'

import { useEffect, useState } from 'react'
import { PackagePlus, Search } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'
import { ModalSelect } from '@/shared/ui/modal-select'
import { ImageLightbox } from '@/shared/ui/image-lightbox'
import { useProductServiceSelectStore } from '../stores/useProductServiceSelectStore'
import {
  getProductServiceCoverImageUrl,
  getProductServiceGalleryImages,
} from '../lib/getProductServiceGalleryImages'
import { getProductServiceTypeLabel } from '../data/data'
import { ProductServiceThumb } from './product-service-thumb'
import { ProductServiceQuickCreateDialog } from './product-service-quick-create-dialog'
import type {
  ProductServiceApiItem,
  ProductServiceJoinApiItem,
} from '../model/product-service-api-item.dto'

interface ProductServicePickerModalProps {
  onSelect: (productService: ProductServiceApiItem) => void
  disabled?: boolean
  triggerLabel?: string
}

/**
 * Botón + modal para elegir un producto/servicio del catálogo con imagen de portada — pensado
 * para el flujo "agregar al carrito" de proformas: a diferencia de <ProductServiceSelect />
 * (combobox compacto usado para editar una línea ya existente), este abre una ventana grande
 * con buscador y tarjetas con imagen, más fácil de reconocer de un vistazo.
 */
export function ProductServicePickerModal({
  onSelect,
  disabled,
  triggerLabel = 'Buscar y agregar producto',
}: ProductServicePickerModalProps) {
  const [open, setOpen] = useState(false)
  const [previewItem, setPreviewItem] = useState<ProductServiceJoinApiItem | null>(null)
  const [quickCreateOpen, setQuickCreateOpen] = useState(false)
  const { options, isLoading, isError, load, setForceReload } = useProductServiceSelectStore()

  useEffect(() => {
    void load()
  }, [])

  const handleCreated = (item: ProductServiceApiItem) => {
    // El item recién creado todavía no está en el caché del select — se recarga para que quede
    // disponible de inmediato si el usuario abre el combobox de esa misma línea para editarla.
    setForceReload(true)
    void load()
    onSelect(item)
  }

  return (
    <>
      <Button type="button" disabled={disabled} className="gap-1.5" onClick={() => setOpen(true)}>
        <Search className="size-4" />
        {triggerLabel}
      </Button>

      <ModalSelect<ProductServiceJoinApiItem>
        open={open}
        onOpenChange={setOpen}
        title="Seleccionar producto o servicio"
        description="Busca por nombre — al elegir uno se agrega al carrito con cantidad 1, luego puedes ajustar todo."
        data={options}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => {
          setForceReload(true)
          void load()
        }}
        getId={(productService) => productService.id}
        columns={[
          {
            header: 'Producto / servicio',
            cell: (productService) => (
              <div className="flex items-center gap-3">
                <ProductServiceThumb
                  imageUrl={getProductServiceCoverImageUrl(productService)}
                  alt={productService.name}
                  onPreview={
                    getProductServiceGalleryImages(productService).length
                      ? () => setPreviewItem(productService)
                      : undefined
                  }
                />
                <div className="flex min-w-0 flex-col">
                  <span className="truncate font-medium">{productService.name}</span>
                  <Badge variant="secondary" className="mt-0.5 w-fit text-[10px] font-normal">
                    {getProductServiceTypeLabel(productService.type)}
                  </Badge>
                </div>
              </div>
            ),
          },
          {
            header: 'Precio',
            cell: (productService) => `S/ ${Number(productService.default_price).toFixed(2)}`,
            className: 'w-28 text-right',
          },
        ]}
        searchPlaceholder="Buscar producto o servicio..."
        emptyMessage="No se encontraron productos o servicios."
        emptyAction={
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => {
              setOpen(false)
              setQuickCreateOpen(true)
            }}
          >
            <PackagePlus className="size-4" />
            Crear producto o servicio
          </Button>
        }
        selectLabel="Agregar"
        onSelect={onSelect}
      />

      {previewItem && (
        <ImageLightbox
          images={getProductServiceGalleryImages(previewItem)}
          open={Boolean(previewItem)}
          onOpenChange={(next) => {
            if (!next) setPreviewItem(null)
          }}
          title={previewItem.name}
        />
      )}

      <ProductServiceQuickCreateDialog
        open={quickCreateOpen}
        onOpenChange={setQuickCreateOpen}
        onCreated={handleCreated}
      />
    </>
  )
}
