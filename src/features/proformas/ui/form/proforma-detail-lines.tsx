// src/features/proformas/ui/form/proforma-detail-lines.tsx
'use client'

import { AlertCircle, Check, Loader2, ShoppingCart, Trash2, X } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import { Textarea } from '@/shared/ui/textarea'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'
import { ProductServiceSelect, ProductServicePickerModal } from '@/features/products-services'
import type { ProductServiceApiItem } from '@/features/products-services'
import { useProformaCart } from '../../hooks'
import { useCartDraftsStore } from '../../stores/useCartDraftsStore'
import {
  addProductToCart,
  saveEditedCartItem,
  removeProductFromCart,
  getSavedItemValue,
  updateDescriptionField,
  updateQuantityField,
  updateUnitPriceField,
  autofillCartItem,
} from '../../lib/proforma-cart'
import { formatProformaCurrency } from '../../data/data'
import { ColumnHeadTip } from './column-head-tip'
import { QuantityInput } from './quantity-input'
import { UnitPriceInput } from './unit-price-input'

interface ProformaDetailLinesProps {
  proformaId: number | null
  currency: string
  /** Se llama cada vez que cambia la cantidad total de productos (guardados + pendientes), para
   * que el formulario padre pueda validar "debe haber al menos un producto" antes de registrar. */
  onCountChange?: (count: number) => void
  /** true cuando se intentó registrar/guardar con el carrito vacío — resalta la sección para que
   * no quede solo como una alerta que desaparece sin dejar rastro visual. */
  cartError?: boolean
}

/** Etiqueta chica sobre cada campo en la vista de tarjetas (mobile) — la tabla usa los headers de
 * columna para esto, pero una tarjeta apilada necesita el rótulo pegado a cada campo. */
function CardFieldLabel({ children }: { children: React.ReactNode }) {
  return <span className="text-muted-foreground text-xs font-medium">{children}</span>
}

export function ProformaDetailLines({
  proformaId,
  currency,
  onCountChange,
  cartError,
}: ProformaDetailLinesProps) {
  const cart = useProformaCart({ proformaId, onCountChange })
  const { discardSavedItemEdit } = useCartDraftsStore()

  const handlePickProduct = async (productService: ProductServiceApiItem) => {
    cart.setIsAddingItem(true)
    // Se pasa el objeto ya elegido/creado directo, sin rebuscarlo en el caché del select — recién
    // creado desde el modal, ese caché puede no haberse actualizado todavía (ver comentario en
    // autofillCartItem.ts) y la línea quedaba con la descripción vacía.
    autofillCartItem({ productServiceId: productService.id, productService })
    await addProductToCart({ proformaId })
    cart.setIsAddingItem(false)
  }

  const showEmptyError = Boolean(cartError) && !cart.hasItems

  return (
    <div className="flex flex-col gap-3">
      {showEmptyError && (
        <div className="border-destructive/50 bg-destructive/10 text-destructive flex items-center gap-2 rounded-lg border px-3 py-2 text-sm">
          <AlertCircle className="size-4 shrink-0" />
          Agrega al menos un producto o servicio para poder registrar la proforma.
        </div>
      )}

      <div
        className={cn(
          'overflow-hidden rounded-lg border',
          showEmptyError && 'border-destructive/50'
        )}
      >
        {cart.isFetching && !cart.hasItems && (
          <div className="text-muted-foreground flex items-center justify-center gap-2 py-10 text-sm">
            <Loader2 className="size-4 animate-spin" />
            Cargando productos...
          </div>
        )}

        {!cart.isFetching && !cart.hasItems && (
          <div
            className={cn(
              'flex flex-col items-center gap-2 px-4 py-10 text-center text-sm',
              showEmptyError ? 'text-destructive' : 'text-muted-foreground'
            )}
          >
            <ShoppingCart className="size-5" />
            <span>Sin productos. Agrega al menos uno para detallar la proforma.</span>
            {cart.isAddingItem ? (
              <Button type="button" disabled size="sm" className="mt-1 gap-1.5">
                <Loader2 className="size-4 animate-spin" />
                Agregando...
              </Button>
            ) : (
              <ProductServicePickerModal
                onSelect={handlePickProduct}
                triggerLabel="Agregar producto"
              />
            )}
          </div>
        )}

        {cart.hasItems && (
          <>
            {/* Desktop (>= sm): tabla clásica con scroll horizontal propio */}
            <div className="hidden max-h-[420px] overflow-auto sm:block">
              <Table>
                <TableHeader className="bg-background sticky top-0 z-10">
                  <TableRow>
                    <TableHead className="min-w-[180px]">
                      <ColumnHeadTip
                        label="Producto/Servicio"
                        tip="Obligatorio al agregar un producto nuevo — elígelo del catálogo para autocompletar descripción, unidad y precio."
                      />
                    </TableHead>
                    <TableHead className="min-w-[280px]">
                      <ColumnHeadTip
                        label="Descripción"
                        tip="Se autocompleta con el nombre del producto/servicio elegido — puedes editarla a mano."
                      />
                    </TableHead>
                    <TableHead className="w-[64px]">
                      <ColumnHeadTip
                        label="Unidad"
                        tip="Se toma del producto/servicio elegido — no se edita por línea."
                      />
                    </TableHead>
                    <TableHead className="w-[140px]">
                      <ColumnHeadTip
                        label="Cantidad"
                        tip="Solo números enteros — usa los botones +/- o escribe directamente."
                      />
                    </TableHead>
                    <TableHead className="min-w-[160px]">
                      <ColumnHeadTip
                        label="P. Unitario"
                        tip="Se autocompleta con el precio del catálogo al elegir un producto/servicio."
                      />
                    </TableHead>
                    <TableHead className="w-[120px] text-right">
                      <ColumnHeadTip
                        label="Total"
                        tip="Se calcula solo: cantidad × precio unitario."
                      />
                    </TableHead>
                    <TableHead className="w-[88px]" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Productos guardados — ya existen en el backend (proforma-details) */}
                  {cart.savedItems.map((row) => {
                    const values = getSavedItemValue(row, cart.savedItemEdits)
                    const isDirty = Boolean(cart.savedItemEdits[row.id])
                    const rowTotal = values.quantity * values.unitPrice + values.tax
                    const isRowBusy = cart.savingItemId === row.id
                    return (
                      <TableRow key={row.id}>
                        <TableCell>
                          <ProductServiceSelect
                            value={values.productServiceId}
                            disabled={isRowBusy}
                            onValueChange={(id) =>
                              autofillCartItem({ productServiceId: id, savedRow: row })
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Textarea
                            rows={1}
                            className="min-h-9 resize-y"
                            value={values.description}
                            disabled={isRowBusy}
                            onChange={(e) =>
                              updateDescriptionField({ value: e.target.value, savedRow: row })
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <span className="text-muted-foreground text-sm">
                            {values.unit || 'UNI'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <QuantityInput
                            value={values.quantity}
                            disabled={isRowBusy}
                            onChange={(value) => updateQuantityField({ value, savedRow: row })}
                          />
                        </TableCell>
                        <TableCell>
                          <UnitPriceInput
                            value={values.unitPrice}
                            disabled={isRowBusy}
                            onChange={(value) => updateUnitPriceField({ value, savedRow: row })}
                          />
                        </TableCell>
                        <TableCell className="text-right text-sm font-medium">
                          {formatProformaCurrency(rowTotal, currency)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-1">
                            {isDirty && (
                              <>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      disabled={isRowBusy}
                                      onClick={async () => {
                                        cart.setSavingItemId(row.id)
                                        const ok = await saveEditedCartItem({
                                          row,
                                          proformaId: proformaId!,
                                          values,
                                        })
                                        cart.setSavingItemId(null)
                                        if (ok) discardSavedItemEdit(row.id)
                                      }}
                                      className="size-8 text-teal-600 hover:bg-teal-500/10 hover:text-teal-600"
                                    >
                                      {isRowBusy ? (
                                        <Loader2 className="size-4 animate-spin" />
                                      ) : (
                                        <Check className="size-4" />
                                      )}
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Guardar cambios de esta línea</TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      disabled={isRowBusy}
                                      onClick={() => discardSavedItemEdit(row.id)}
                                      className="size-8"
                                    >
                                      <X className="size-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Descartar cambios</TooltipContent>
                                </Tooltip>
                              </>
                            )}
                            {!isDirty && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    disabled={isRowBusy}
                                    onClick={() =>
                                      removeProductFromCart({ proformaId, savedRow: row })
                                    }
                                    className="text-destructive hover:bg-destructive/10 hover:text-destructive size-8"
                                  >
                                    <Trash2 className="size-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Quitar producto</TooltipContent>
                              </Tooltip>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}

                  {/* Productos pendientes — agregados antes de que la proforma tuviera id (usePendingCartItemsStore) */}
                  {cart.pendingCartItems.map((item) => {
                    const rowTotal = item.quantity * item.unitPrice + item.tax
                    const isRowUploading = cart.uploadingTempId === item.tempId
                    return (
                      <TableRow key={item.tempId} className="bg-muted/30">
                        <TableCell>
                          <ProductServiceSelect
                            value={item.productServiceId}
                            disabled={isRowUploading}
                            onValueChange={(id) =>
                              autofillCartItem({ productServiceId: id, pendingTempId: item.tempId })
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Textarea
                            rows={1}
                            className="min-h-9 resize-y"
                            value={item.description}
                            disabled={isRowUploading}
                            onChange={(e) =>
                              updateDescriptionField({
                                value: e.target.value,
                                pendingTempId: item.tempId,
                              })
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <span className="text-muted-foreground text-sm">
                            {item.unit || 'UNI'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <QuantityInput
                            value={item.quantity}
                            disabled={isRowUploading}
                            onChange={(value) =>
                              updateQuantityField({ value, pendingTempId: item.tempId })
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <UnitPriceInput
                            value={item.unitPrice}
                            disabled={isRowUploading}
                            onChange={(value) =>
                              updateUnitPriceField({ value, pendingTempId: item.tempId })
                            }
                          />
                        </TableCell>
                        <TableCell className="text-right text-sm font-medium">
                          {formatProformaCurrency(rowTotal, currency)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-1">
                            {isRowUploading ? (
                              <Loader2 className="text-muted-foreground size-4 animate-spin" />
                            ) : (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() =>
                                      removeProductFromCart({
                                        proformaId,
                                        pendingTempId: item.tempId,
                                      })
                                    }
                                    className="text-destructive hover:bg-destructive/10 hover:text-destructive size-8"
                                  >
                                    <Trash2 className="size-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Quitar producto</TooltipContent>
                              </Tooltip>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Mobile (< sm): tarjetas apiladas — la tabla de 7 columnas es imposible de leer y de
             * scrollear horizontalmente con el dedo en una pantalla chica. */}
            <div className="flex max-h-[420px] flex-col gap-2 overflow-auto p-2 sm:hidden">
              {cart.savedItems.map((row) => {
                const values = getSavedItemValue(row, cart.savedItemEdits)
                const isDirty = Boolean(cart.savedItemEdits[row.id])
                const rowTotal = values.quantity * values.unitPrice + values.tax
                const isRowBusy = cart.savingItemId === row.id
                return (
                  <div key={row.id} className="flex flex-col gap-2.5 rounded-lg border p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex min-w-0 flex-1 flex-col gap-1">
                        <CardFieldLabel>Producto/Servicio</CardFieldLabel>
                        <ProductServiceSelect
                          value={values.productServiceId}
                          disabled={isRowBusy}
                          onValueChange={(id) =>
                            autofillCartItem({ productServiceId: id, savedRow: row })
                          }
                        />
                      </div>
                      <div className="flex shrink-0 items-center gap-1 pt-4">
                        {isDirty ? (
                          <>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              disabled={isRowBusy}
                              onClick={async () => {
                                cart.setSavingItemId(row.id)
                                const ok = await saveEditedCartItem({
                                  row,
                                  proformaId: proformaId!,
                                  values,
                                })
                                cart.setSavingItemId(null)
                                if (ok) discardSavedItemEdit(row.id)
                              }}
                              className="size-8 text-teal-600 hover:bg-teal-500/10 hover:text-teal-600"
                            >
                              {isRowBusy ? (
                                <Loader2 className="size-4 animate-spin" />
                              ) : (
                                <Check className="size-4" />
                              )}
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              disabled={isRowBusy}
                              onClick={() => discardSavedItemEdit(row.id)}
                              className="size-8"
                            >
                              <X className="size-4" />
                            </Button>
                          </>
                        ) : (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            disabled={isRowBusy}
                            onClick={() => removeProductFromCart({ proformaId, savedRow: row })}
                            className="text-destructive hover:bg-destructive/10 hover:text-destructive size-8"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <CardFieldLabel>Descripción</CardFieldLabel>
                      <Textarea
                        rows={1}
                        className="min-h-9 resize-y"
                        value={values.description}
                        disabled={isRowBusy}
                        onChange={(e) =>
                          updateDescriptionField({ value: e.target.value, savedRow: row })
                        }
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex flex-col gap-1">
                        <CardFieldLabel>Unidad</CardFieldLabel>
                        <span className="text-sm">{values.unit || 'UNI'}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <CardFieldLabel>Cantidad</CardFieldLabel>
                        <QuantityInput
                          value={values.quantity}
                          disabled={isRowBusy}
                          onChange={(value) => updateQuantityField({ value, savedRow: row })}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex flex-col gap-1">
                        <CardFieldLabel>P. Unitario</CardFieldLabel>
                        <UnitPriceInput
                          value={values.unitPrice}
                          disabled={isRowBusy}
                          onChange={(value) => updateUnitPriceField({ value, savedRow: row })}
                        />
                      </div>
                      <div className="flex flex-col items-end justify-end gap-1">
                        <CardFieldLabel>Total</CardFieldLabel>
                        <span className="text-sm font-medium">
                          {formatProformaCurrency(rowTotal, currency)}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}

              {cart.pendingCartItems.map((item) => {
                const rowTotal = item.quantity * item.unitPrice + item.tax
                const isRowUploading = cart.uploadingTempId === item.tempId
                return (
                  <div
                    key={item.tempId}
                    className="bg-muted/30 flex flex-col gap-2.5 rounded-lg border p-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex min-w-0 flex-1 flex-col gap-1">
                        <CardFieldLabel>Producto/Servicio</CardFieldLabel>
                        <ProductServiceSelect
                          value={item.productServiceId}
                          disabled={isRowUploading}
                          onValueChange={(id) =>
                            autofillCartItem({ productServiceId: id, pendingTempId: item.tempId })
                          }
                        />
                      </div>
                      <div className="flex shrink-0 items-center gap-1 pt-4">
                        {isRowUploading ? (
                          <Loader2 className="text-muted-foreground size-4 animate-spin" />
                        ) : (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              removeProductFromCart({ proformaId, pendingTempId: item.tempId })
                            }
                            className="text-destructive hover:bg-destructive/10 hover:text-destructive size-8"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <CardFieldLabel>Descripción</CardFieldLabel>
                      <Textarea
                        rows={1}
                        className="min-h-9 resize-y"
                        value={item.description}
                        disabled={isRowUploading}
                        onChange={(e) =>
                          updateDescriptionField({
                            value: e.target.value,
                            pendingTempId: item.tempId,
                          })
                        }
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex flex-col gap-1">
                        <CardFieldLabel>Unidad</CardFieldLabel>
                        <span className="text-sm">{item.unit || '—'}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <CardFieldLabel>Cantidad</CardFieldLabel>
                        <QuantityInput
                          value={item.quantity}
                          disabled={isRowUploading}
                          onChange={(value) =>
                            updateQuantityField({ value, pendingTempId: item.tempId })
                          }
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex flex-col gap-1">
                        <CardFieldLabel>P. Unitario</CardFieldLabel>
                        <UnitPriceInput
                          value={item.unitPrice}
                          disabled={isRowUploading}
                          onChange={(value) =>
                            updateUnitPriceField({ value, pendingTempId: item.tempId })
                          }
                        />
                      </div>
                      <div className="flex flex-col items-end justify-end gap-1">
                        <CardFieldLabel>Total</CardFieldLabel>
                        <span className="text-sm font-medium">
                          {formatProformaCurrency(rowTotal, currency)}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}

        {/* Pie de la tabla — solo aparece cuando ya hay al menos un producto (si está vacío, el
         * botón de agregar ya vive dentro del bloque "Sin productos" de arriba). Queda fuera del
         * área con scroll propio para no tener que buscarlo aunque el carrito crezca mucho. */}
        {cart.hasItems && (
          <div className="bg-muted/30 flex justify-end border-t px-3 py-2.5">
            {cart.isAddingItem ? (
              <Button type="button" disabled size="sm" className="gap-1.5">
                <Loader2 className="size-4 animate-spin" />
                Agregando...
              </Button>
            ) : (
              <ProductServicePickerModal onSelect={handlePickProduct} />
            )}
          </div>
        )}
      </div>

      <div className="ml-auto flex w-full max-w-xs flex-col gap-1 rounded-lg border p-4 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-medium">
            {formatProformaCurrency(cart.totals.subtotal, currency)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Impuestos</span>
          <span className="font-medium">{formatProformaCurrency(cart.totals.tax, currency)}</span>
        </div>
        <div className="mt-1 flex justify-between border-t pt-1 text-base">
          <span className="font-semibold">Total</span>
          <span className="font-bold">{formatProformaCurrency(cart.totals.total, currency)}</span>
        </div>
      </div>
    </div>
  )
}
