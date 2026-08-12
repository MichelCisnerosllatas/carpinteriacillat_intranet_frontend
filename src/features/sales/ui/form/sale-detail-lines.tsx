// src/features/sales/ui/form/sale-detail-lines.tsx
'use client'

import { AlertCircle, Check, Loader2, Lock, ShoppingCart, Trash2, X } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'
import { ProductServiceSelect, ProductServicePickerModal } from '@/features/products-services'
import type { ProductServiceApiItem } from '@/features/products-services'
import { useSaleCart } from '../../hooks'
import { useCartDraftsStore } from '../../stores/useCartDraftsStore'
import {
  addProductToCart,
  saveEditedCartItem,
  removeProductFromCart,
  getSavedItemValue,
  updateDescriptionField,
  updateUnitField,
  updateQuantityField,
  updateUnitPriceField,
  autofillCartItem,
} from '../../lib/sale-cart'
import { formatSaleCurrency } from '../../data/data'
import { ColumnHeadTip } from './column-head-tip'
import { QuantityInput } from './quantity-input'
import type { CartTaxPreview } from '../../lib/sale-cart'

interface SaleDetailLinesProps {
  saleId: number | null
  currency: string
  /** Se llama cada vez que cambia la cantidad total de productos (guardados + pendientes), para
   * que el formulario padre pueda validar "debe haber al menos un producto" antes de registrar. */
  onCountChange?: (count: number) => void
  /** true cuando se intentó registrar/guardar con el carrito vacío — resalta la sección para que
   * no quede solo como una alerta que desaparece sin dejar rastro visual. */
  cartError?: boolean
  /** El carrito solo se puede editar mientras la venta está GUARDADA (ver sale-details.md) — en
   * creación siempre es editable (la venta todavía no existe). `undefined` = editable. */
  readOnly?: boolean
  /** Si ya se sabe si la venta va a gravar IGV (ver header-section.tsx), se usa para mostrar el
   * total real de los productos pendientes en vez de un "+ IGV al guardar" ambiguo. */
  taxPreview?: CartTaxPreview
}

/** Subtotal × tasa, redondeado a 2 decimales — mismo criterio que usa el servidor. */
function previewTax(subtotal: number, taxPreview: CartTaxPreview | undefined): number {
  if (!taxPreview?.willBeTaxed) return 0
  return Math.round(subtotal * (taxPreview.rate / 100) * 100) / 100
}

/** Etiqueta chica sobre cada campo en la vista de tarjetas (mobile) — la tabla usa los headers de
 * columna para esto, pero una tarjeta apilada necesita el rótulo pegado a cada campo. */
function CardFieldLabel({ children }: { children: React.ReactNode }) {
  return <span className="text-muted-foreground text-xs font-medium">{children}</span>
}

export function SaleDetailLines({
  saleId,
  currency,
  onCountChange,
  cartError,
  readOnly,
  taxPreview,
}: SaleDetailLinesProps) {
  const cart = useSaleCart({ saleId, onCountChange, taxPreview })
  const { discardSavedItemEdit } = useCartDraftsStore()

  const handlePickProduct = async (productService: ProductServiceApiItem) => {
    cart.setIsAddingItem(true)
    autofillCartItem({ productServiceId: productService.id })
    await addProductToCart({ saleId })
    cart.setIsAddingItem(false)
  }

  const showEmptyError = Boolean(cartError) && !cart.hasItems

  return (
    <div className="flex flex-col gap-3">
      {readOnly && (
        <div className="text-muted-foreground flex items-center gap-2 rounded-lg border px-3 py-2 text-sm">
          <Lock className="size-4 shrink-0" />
          Esta venta ya no está en estado Guardada — las líneas de detalle no se pueden modificar.
        </div>
      )}

      {showEmptyError && (
        <div className="border-destructive/50 bg-destructive/10 text-destructive flex items-center gap-2 rounded-lg border px-3 py-2 text-sm">
          <AlertCircle className="size-4 shrink-0" />
          Agrega al menos un producto o servicio para poder registrar la venta.
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
            <span>Sin productos. Agrega al menos uno para detallar la venta.</span>
            {!readOnly && (
              cart.isAddingItem ? (
                <Button type="button" disabled size="sm" className="mt-1 gap-1.5">
                  <Loader2 className="size-4 animate-spin" />
                  Agregando...
                </Button>
              ) : (
                <ProductServicePickerModal
                  onSelect={handlePickProduct}
                  triggerLabel="Agregar producto"
                />
              )
            )}
          </div>
        )}

        {cart.hasItems && (
          <>
            {/* Desktop (>= sm): tabla clásica con scroll horizontal propio */}
            <div className="hidden max-h-[420px] overflow-auto sm:block">
              <Table>
                <TableHeader className="bg-muted/50 sticky top-0 z-10">
                  <TableRow className="hover:bg-transparent">
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
                      <ColumnHeadTip label="Unidad" tip="Texto libre, ej: NIU, KG, HRS." />
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
                    <TableHead className="w-[130px] text-right">
                      <ColumnHeadTip
                        label="Total"
                        tip="El impuesto siempre lo calcula el servidor al guardar — mientras el producto no se guarda, este total es solo un preview sin IGV."
                      />
                    </TableHead>
                    {!readOnly && <TableHead className="w-[88px]" />}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Productos guardados — ya existen en el backend (sale-details). Filas en
                   * cebra (bg alternado) para que se distinga como tabla y no como una pila de
                   * inputs sueltos. */}
                  {cart.savedItems.map((row, index) => {
                    const values = getSavedItemValue(row, cart.savedItemEdits)
                    const isDirty = Boolean(cart.savedItemEdits[row.id])
                    const isRowBusy = cart.savingItemId === row.id
                    return (
                      <TableRow key={row.id} className={cn(index % 2 === 1 && 'bg-muted/20')}>
                        <TableCell>
                          <ProductServiceSelect
                            value={values.productServiceId}
                            disabled={isRowBusy || readOnly}
                            onValueChange={(id) =>
                              autofillCartItem({ productServiceId: id, savedRow: row })
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={values.description}
                            disabled={isRowBusy || readOnly}
                            onChange={(e) =>
                              updateDescriptionField({ value: e.target.value, savedRow: row })
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={values.unit}
                            disabled={isRowBusy || readOnly}
                            onChange={(e) =>
                              updateUnitField({ value: e.target.value, savedRow: row })
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <QuantityInput
                            value={values.quantity}
                            disabled={isRowBusy || readOnly}
                            onChange={(value) => updateQuantityField({ value, savedRow: row })}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={values.unitPrice}
                            disabled={isRowBusy || readOnly}
                            onChange={(e) =>
                              updateUnitPriceField({ value: Number(e.target.value), savedRow: row })
                            }
                          />
                        </TableCell>
                        <TableCell className="text-right text-sm font-medium">
                          {formatSaleCurrency(row.total, currency)}
                        </TableCell>
                        {!readOnly && (
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
                                            saleId: saleId!,
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
                                      onClick={() => removeProductFromCart({ saleId, savedRow: row })}
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
                        )}
                      </TableRow>
                    )
                  })}

                  {/* Productos pendientes — agregados antes de que la venta tuviera id (usePendingCartItemsStore) */}
                  {cart.pendingCartItems.map((item) => {
                    const pendingSubtotal = item.quantity * item.unitPrice
                    const rowTax = previewTax(pendingSubtotal, taxPreview)
                    const rowTotal = pendingSubtotal + rowTax
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
                          <Input
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
                          <Input
                            value={item.unit}
                            disabled={isRowUploading}
                            onChange={(e) =>
                              updateUnitField({ value: e.target.value, pendingTempId: item.tempId })
                            }
                          />
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
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={item.unitPrice}
                            disabled={isRowUploading}
                            onChange={(e) =>
                              updateUnitPriceField({
                                value: Number(e.target.value),
                                pendingTempId: item.tempId,
                              })
                            }
                          />
                        </TableCell>
                        <TableCell className="text-right text-sm">
                          <span className="font-medium">{formatSaleCurrency(rowTotal, currency)}</span>
                          {taxPreview?.willBeTaxed == null && (
                            <span className="text-muted-foreground block text-[10px]">+ IGV al guardar</span>
                          )}
                        </TableCell>
                        {!readOnly && (
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
                                          saleId,
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
                        )}
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Mobile (< sm): tarjetas apiladas — la tabla de columnas es imposible de leer y de
             * scrollear horizontalmente con el dedo en una pantalla chica. */}
            <div className="flex max-h-[420px] flex-col gap-2 overflow-auto p-2 sm:hidden">
              {cart.savedItems.map((row) => {
                const values = getSavedItemValue(row, cart.savedItemEdits)
                const isDirty = Boolean(cart.savedItemEdits[row.id])
                const isRowBusy = cart.savingItemId === row.id
                return (
                  <div key={row.id} className="flex flex-col gap-2.5 rounded-lg border p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex min-w-0 flex-1 flex-col gap-1">
                        <CardFieldLabel>Producto/Servicio</CardFieldLabel>
                        <ProductServiceSelect
                          value={values.productServiceId}
                          disabled={isRowBusy || readOnly}
                          onValueChange={(id) =>
                            autofillCartItem({ productServiceId: id, savedRow: row })
                          }
                        />
                      </div>
                      {!readOnly && (
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
                                    saleId: saleId!,
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
                              onClick={() => removeProductFromCart({ saleId, savedRow: row })}
                              className="text-destructive hover:bg-destructive/10 hover:text-destructive size-8"
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-1">
                      <CardFieldLabel>Descripción</CardFieldLabel>
                      <Input
                        value={values.description}
                        disabled={isRowBusy || readOnly}
                        onChange={(e) =>
                          updateDescriptionField({ value: e.target.value, savedRow: row })
                        }
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex flex-col gap-1">
                        <CardFieldLabel>Unidad</CardFieldLabel>
                        <Input
                          value={values.unit}
                          disabled={isRowBusy || readOnly}
                          onChange={(e) =>
                            updateUnitField({ value: e.target.value, savedRow: row })
                          }
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <CardFieldLabel>Cantidad</CardFieldLabel>
                        <QuantityInput
                          value={values.quantity}
                          disabled={isRowBusy || readOnly}
                          onChange={(value) => updateQuantityField({ value, savedRow: row })}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex flex-col gap-1">
                        <CardFieldLabel>P. Unitario</CardFieldLabel>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={values.unitPrice}
                          disabled={isRowBusy || readOnly}
                          onChange={(e) =>
                            updateUnitPriceField({ value: Number(e.target.value), savedRow: row })
                          }
                        />
                      </div>
                      <div className="flex flex-col items-end justify-end gap-1">
                        <CardFieldLabel>Total</CardFieldLabel>
                        <span className="text-sm font-medium">
                          {formatSaleCurrency(row.total, currency)}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}

              {cart.pendingCartItems.map((item) => {
                const pendingSubtotal = item.quantity * item.unitPrice
                const rowTax = previewTax(pendingSubtotal, taxPreview)
                const rowTotal = pendingSubtotal + rowTax
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
                              removeProductFromCart({ saleId, pendingTempId: item.tempId })
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
                      <Input
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
                        <Input
                          value={item.unit}
                          disabled={isRowUploading}
                          onChange={(e) =>
                            updateUnitField({ value: e.target.value, pendingTempId: item.tempId })
                          }
                        />
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
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={item.unitPrice}
                          disabled={isRowUploading}
                          onChange={(e) =>
                            updateUnitPriceField({
                              value: Number(e.target.value),
                              pendingTempId: item.tempId,
                            })
                          }
                        />
                      </div>
                      <div className="flex flex-col items-end justify-end gap-1">
                        <CardFieldLabel>Total</CardFieldLabel>
                        <span className="text-sm font-medium">
                          {formatSaleCurrency(rowTotal, currency)}
                        </span>
                        {taxPreview?.willBeTaxed == null && (
                          <span className="text-muted-foreground text-[10px]">+ IGV al guardar</span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}

        {/* Pie de la tabla — solo aparece cuando ya hay al menos un producto y el carrito es
         * editable (si está vacío, el botón de agregar ya vive dentro del bloque "Sin
         * productos" de arriba; si es de solo lectura, no hay nada que agregar). */}
        {cart.hasItems && !readOnly && (
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
          <span className="font-medium">{formatSaleCurrency(cart.totals.subtotal, currency)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">
            IGV{cart.totals.hasPendingTax && <span className="ml-1">*</span>}
          </span>
          <span className="font-medium">{formatSaleCurrency(cart.totals.tax, currency)}</span>
        </div>
        <div className="mt-1 flex justify-between border-t pt-1 text-base">
          <span className="font-semibold">Total</span>
          <span className="font-bold">{formatSaleCurrency(cart.totals.total, currency)}</span>
        </div>
        {cart.totals.hasPendingTax && (
          <p className="text-muted-foreground mt-1 text-[10px]">
            * No incluye el impuesto de los productos pendientes — se calcula al guardar.
          </p>
        )}
      </div>
    </div>
  )
}
