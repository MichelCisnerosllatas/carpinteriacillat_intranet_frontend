'use client'

import { useEffect, useMemo, useState } from 'react'
import { PackagePlus, Search } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { useCan } from '@/features/auth/hooks/usePermission'
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
  ProductServiceType,
} from '../model/product-service-api-item.dto'

type TypeTab = 'all' | ProductServiceType

const TYPE_TABS: { value: TypeTab; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'product', label: 'Productos' },
  { value: 'service', label: 'Servicios' },
]

interface ProductServicePickerModalProps {
  onSelect: (productService: ProductServiceApiItem) => void
  disabled?: boolean
  triggerLabel?: string
  /** Modo controlado (opcional): si se pasa `open`, quien lo usa decide cuándo abrirlo (ej. con
   * un atajo de teclado) y NO se pinta el botón disparador propio. Proformas no lo usa. */
  open?: boolean
  onOpenChange?: (open: boolean) => void
  /** Muestra pestañas "Todos / Productos / Servicios" encima de la tabla. */
  showTypeTabs?: boolean
}

/**
 * Botón + modal para elegir un producto/servicio del catálogo con imagen de portada. Lo usan
 * proformas ("agregar al carrito") y "Realizar venta" (en modo controlado y con pestañas).
 */
export function ProductServicePickerModal({
  onSelect,
  disabled,
  triggerLabel = 'Buscar y agregar producto',
  open: controlledOpen,
  onOpenChange,
  showTypeTabs = false,
}: ProductServicePickerModalProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : internalOpen
  const setOpen = (next: boolean) => {
    if (isControlled) onOpenChange?.(next)
    else setInternalOpen(next)
  }

  const [typeTab, setTypeTab] = useState<TypeTab>('all')
  const [previewItem, setPreviewItem] = useState<ProductServiceJoinApiItem | null>(null)
  const [quickCreateOpen, setQuickCreateOpen] = useState(false)
  // Solo si tiene permiso de crear productos/servicios (ver ROLES_Y_PERMISOS.md)
  const canCreate = useCan('products_services.create')
  const { options, isLoading, isError, load, setForceReload } = useProductServiceSelectStore()

  useEffect(() => {
    void load()
  }, [])

  // Las pestañas filtran por `type` antes de pasarle los datos al modal (que filtra por texto).
  const data = useMemo(
    () => (typeTab === 'all' ? options : options.filter((o) => o.type === typeTab)),
    [options, typeTab]
  )

  const handleCreateNew = () => {
    setOpen(false)
    setQuickCreateOpen(true)
  }

  const handleCreated = (item: ProductServiceApiItem) => {
    // El item recién creado todavía no está en el caché del select — se recarga para que quede
    // disponible de inmediato si el usuario abre el combobox de esa misma línea para editarla.
    setForceReload(true)
    void load()
    onSelect(item)
  }

  return (
    <>
      {!isControlled && (
        <Button type="button" disabled={disabled} className="gap-1.5" onClick={() => setOpen(true)}>
          <Search className="size-4" />
          {triggerLabel}
        </Button>
      )}

      <ModalSelect<ProductServiceJoinApiItem>
        open={open}
        onOpenChange={setOpen}
        title="Seleccionar producto o servicio"
        description="Busca por nombre — al elegir uno se agrega al carrito con cantidad 1, luego puedes ajustar todo."
        data={data}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => {
          setForceReload(true)
          void load()
        }}
        getId={(productService) => productService.id}
        // Filtro propio: la columna principal es JSX (imagen + nombre), así que el filtro por
        // defecto del modal no la podía leer y la búsqueda por nombre no encontraba nada.
        filterFn={(productService, search) => {
          const term = search.trim().toLowerCase()
          if (!term) return true
          return [productService.name, productService.description, productService.unit]
            .filter(Boolean)
            .some((value) => String(value).toLowerCase().includes(term))
        }}
        toolbar={
          showTypeTabs ? (
            <div className="flex gap-1" role="tablist" aria-label="Tipo">
              {TYPE_TABS.map((tab) => (
                <Button
                  key={tab.value}
                  type="button"
                  size="sm"
                  role="tab"
                  aria-selected={typeTab === tab.value}
                  variant={typeTab === tab.value ? 'default' : 'outline'}
                  className="h-7"
                  onClick={() => setTypeTab(tab.value)}
                >
                  {tab.label}
                </Button>
              ))}
            </div>
          ) : undefined
        }
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
            header: 'Unidad',
            cell: (productService) => productService.unit ?? '—',
            className: 'w-20',
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
          canCreate && <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={handleCreateNew}>
            <PackagePlus className="size-4" />
            Crear producto o servicio
          </Button>
        }
        selectLabel="Agregar"
        onSelect={onSelect}
        onCreateNew={canCreate ? handleCreateNew : undefined}
        createLabel="Nuevo"
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
