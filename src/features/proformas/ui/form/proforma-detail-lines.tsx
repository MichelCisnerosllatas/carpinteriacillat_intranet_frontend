// src/features/proformas/ui/form/proforma-detail-lines.tsx
'use client'

import { Check, Loader2, Plus, Trash2, X } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'
import { ProductServiceSelect } from '@/features/products-services'
import { useProformaCart } from '../../hooks'
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
} from '../../lib/proforma-cart'
import { formatProformaCurrency } from '../../data/data'
import { ColumnHeadTip } from './column-head-tip'
import { QuantityInput } from './quantity-input'

interface ProformaDetailLinesProps {
  proformaId: number | null
  currency: string
  /** Se llama cada vez que cambia la cantidad total de productos (guardados + pendientes), para
   * que el formulario padre pueda validar "debe haber al menos un producto" antes de registrar. */
  onCountChange?: (count: number) => void
}

export function ProformaDetailLines({ proformaId, currency, onCountChange }: ProformaDetailLinesProps) {
  const cart = useProformaCart({ proformaId, onCountChange })
  const { discardSavedItemEdit } = useCartDraftsStore()

  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[180px]">
                <ColumnHeadTip label="Producto/Servicio" tip="Obligatorio al agregar un producto nuevo — elígelo del catálogo para autocompletar descripción, unidad y precio." />
              </TableHead>
              <TableHead className="min-w-[280px]">
                <ColumnHeadTip label="Descripción" tip="Se autocompleta con el nombre del producto/servicio elegido — puedes editarla a mano." />
              </TableHead>
              <TableHead className="w-[64px]">
                <ColumnHeadTip label="Unidad" tip="Texto libre, ej: NIU, KG, HRS." />
              </TableHead>
              <TableHead className="w-[140px]">
                <ColumnHeadTip label="Cantidad" tip="Solo números enteros — usa los botones +/- o escribe directamente." />
              </TableHead>
              <TableHead className="min-w-[160px]">
                <ColumnHeadTip label="P. Unitario" tip="Se autocompleta con el precio del catálogo al elegir un producto/servicio." />
              </TableHead>
              <TableHead className="w-[120px] text-right">
                <ColumnHeadTip label="Total" tip="Se calcula solo: cantidad × precio unitario." />
              </TableHead>
              <TableHead className="w-[88px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {cart.isFetching && !cart.hasItems && (
              <TableRow>
                <TableCell colSpan={7} className="h-20 text-center text-sm text-muted-foreground">
                  <Loader2 className="mx-auto mb-1 size-4 animate-spin" />
                  Cargando productos...
                </TableCell>
              </TableRow>
            )}
            {!cart.isFetching && !cart.hasItems && (
              <TableRow>
                <TableCell colSpan={7} className="text-muted-foreground h-20 text-center text-sm">
                  Sin productos. Agrega al menos uno para detallar la proforma.
                </TableCell>
              </TableRow>
            )}

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
                      onValueChange={(id) => autofillCartItem({ productServiceId: id, savedRow: row })}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={values.description}
                      disabled={isRowBusy}
                      onChange={(e) => updateDescriptionField({ value: e.target.value, savedRow: row })}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={values.unit}
                      disabled={isRowBusy}
                      onChange={(e) => updateUnitField({ value: e.target.value, savedRow: row })}
                    />
                  </TableCell>
                  <TableCell>
                    <QuantityInput
                      value={values.quantity}
                      disabled={isRowBusy}
                      onChange={(value) => updateQuantityField({ value, savedRow: row })}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number" step="0.01" min="0"
                      value={values.unitPrice}
                      disabled={isRowBusy}
                      onChange={(e) => updateUnitPriceField({ value: Number(e.target.value), savedRow: row })}
                    />
                  </TableCell>
                  <TableCell className="text-right text-sm font-medium">
                    {formatProformaCurrency(rowTotal, currency)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      {isDirty && (
                        <>
                          <Button
                            type="button" variant="ghost" size="icon" disabled={isRowBusy}
                            onClick={async () => {
                              cart.setSavingItemId(row.id)
                              const ok = await saveEditedCartItem({ row, proformaId: proformaId!, values })
                              cart.setSavingItemId(null)
                              if (ok) discardSavedItemEdit(row.id)
                            }}
                            className="text-teal-600 hover:bg-teal-500/10 hover:text-teal-600 size-8"
                          >
                            {isRowBusy ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
                          </Button>
                          <Button
                            type="button" variant="ghost" size="icon" disabled={isRowBusy}
                            onClick={() => discardSavedItemEdit(row.id)}
                            className="size-8"
                          >
                            <X className="size-4" />
                          </Button>
                        </>
                      )}
                      {!isDirty && (
                        <Button
                          type="button" variant="ghost" size="icon" disabled={isRowBusy}
                          onClick={() => removeProductFromCart({ proformaId, savedRow: row })}
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive size-8"
                        >
                          <Trash2 className="size-4" />
                        </Button>
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
                      onValueChange={(id) => autofillCartItem({ productServiceId: id, pendingTempId: item.tempId })}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={item.description}
                      disabled={isRowUploading}
                      onChange={(e) => updateDescriptionField({ value: e.target.value, pendingTempId: item.tempId })}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={item.unit}
                      disabled={isRowUploading}
                      onChange={(e) => updateUnitField({ value: e.target.value, pendingTempId: item.tempId })}
                    />
                  </TableCell>
                  <TableCell>
                    <QuantityInput
                      value={item.quantity}
                      disabled={isRowUploading}
                      onChange={(value) => updateQuantityField({ value, pendingTempId: item.tempId })}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number" step="0.01" min="0"
                      value={item.unitPrice}
                      disabled={isRowUploading}
                      onChange={(e) => updateUnitPriceField({ value: Number(e.target.value), pendingTempId: item.tempId })}
                    />
                  </TableCell>
                  <TableCell className="text-right text-sm font-medium">
                    {formatProformaCurrency(rowTotal, currency)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      {isRowUploading ? (
                        <Loader2 className="size-4 animate-spin text-muted-foreground" />
                      ) : (
                        <Button
                          type="button" variant="ghost" size="icon"
                          onClick={() => removeProductFromCart({ proformaId, pendingTempId: item.tempId })}
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive size-8"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {/* Formulario "Agregar producto" — su borrador (newItem) vive en useCartDraftsStore */}
      <div className="flex flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-end sm:gap-2">
        <div className="grid flex-1 grid-cols-2 gap-2 sm:grid-cols-[1.2fr_2fr_0.7fr_1.3fr_1fr]">
          <div className="col-span-2 sm:col-span-1">
            <ProductServiceSelect
              value={cart.newItem.productServiceId}
              disabled={cart.isAddingItem}
              onValueChange={(id) => autofillCartItem({ productServiceId: id })}
            />
          </div>
          <Input
            placeholder="Descripción" disabled={cart.isAddingItem}
            value={cart.newItem.description}
            onChange={(e) => updateDescriptionField({ value: e.target.value })}
          />
          <Input
            placeholder="Unidad" disabled={cart.isAddingItem}
            value={cart.newItem.unit}
            onChange={(e) => updateUnitField({ value: e.target.value })}
          />
          <QuantityInput
            value={cart.newItem.quantity}
            disabled={cart.isAddingItem}
            onChange={(value) => updateQuantityField({ value })}
          />
          <Input
            type="number" step="0.01" min="0" placeholder="P. Unit." disabled={cart.isAddingItem}
            value={cart.newItem.unitPrice}
            onChange={(e) => updateUnitPriceField({ value: Number(e.target.value) })}
          />
        </div>
        <Button
          type="button" size="sm" disabled={cart.isAddingItem} className="gap-1.5"
          onClick={async () => {
            cart.setIsAddingItem(true)
            await addProductToCart({ proformaId })
            cart.setIsAddingItem(false)
          }}
        >
          {cart.isAddingItem ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
          Agregar producto
        </Button>
      </div>

      <div className="ml-auto flex w-full max-w-xs flex-col gap-1 rounded-lg border p-4 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-medium">{formatProformaCurrency(cart.totals.subtotal, currency)}</span>
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
