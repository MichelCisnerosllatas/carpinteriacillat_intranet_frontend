'use client'

import { useFieldArray, type Control, type UseFormReturn } from 'react-hook-form'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'
import { ProductServiceSelect, useProductServiceSelectStore } from '@/features/products-services'
import type { ProformaFormValues } from './proforma-form'

interface ProformaDetailLinesProps {
  form: UseFormReturn<ProformaFormValues>
  control: Control<ProformaFormValues>
  disabled?: boolean
}

const formatCurrency = (value: number, currency: string) =>
  `${currency} ${Number.isFinite(value) ? value.toFixed(2) : '0.00'}`

export function ProformaDetailLines({ form, control, disabled }: ProformaDetailLinesProps) {
  const { fields, append, remove } = useFieldArray({ control, name: 'details' })
  const details = form.watch('details')
  const currency = form.watch('currency') || 'PEN'
  const { options: productServiceOptions } = useProductServiceSelectStore()

  const subtotal = details.reduce((acc, d) => acc + (Number(d.quantity) || 0) * (Number(d.unitPrice) || 0), 0)
  const taxTotal = details.reduce((acc, d) => acc + (Number(d.tax) || 0), 0)
  const total = subtotal + taxTotal

  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[200px]">Producto/Servicio</TableHead>
              <TableHead className="min-w-[200px]">Descripción</TableHead>
              <TableHead className="w-[100px]">Unidad</TableHead>
              <TableHead className="w-[100px]">Cantidad</TableHead>
              <TableHead className="w-[130px]">P. Unitario</TableHead>
              <TableHead className="w-[130px] text-right">Subtotal</TableHead>
              <TableHead className="w-[48px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {fields.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="h-20 text-center text-sm text-muted-foreground">
                  Sin líneas. Agrega al menos una para detallar la proforma.
                </TableCell>
              </TableRow>
            )}
            {fields.map((field, index) => {
              const quantity = Number(form.watch(`details.${index}.quantity`)) || 0
              const unitPrice = Number(form.watch(`details.${index}.unitPrice`)) || 0
              const rowSubtotal = quantity * unitPrice
              return (
                <TableRow key={field.id}>
                  <TableCell>
                    <ProductServiceSelect
                      value={form.watch(`details.${index}.productServiceId`) ?? null}
                      disabled={disabled}
                      onValueChange={(id) => {
                        form.setValue(`details.${index}.productServiceId`, id)
                        // Prellenar descripción/unidad/precio al elegir un producto/servicio.
                        const picked = productServiceOptions.find((o) => o.id === id)
                        if (picked) {
                          if (!form.getValues(`details.${index}.description`)) {
                            form.setValue(`details.${index}.description`, picked.name)
                          }
                          form.setValue(`details.${index}.unit`, picked.unit ?? '')
                          form.setValue(`details.${index}.unitPrice`, Number(picked.default_price))
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      placeholder="Descripción"
                      disabled={disabled}
                      {...form.register(`details.${index}.description`)}
                    />
                  </TableCell>
                  <TableCell>
                    <Input placeholder="Unid." disabled={disabled} {...form.register(`details.${index}.unit`)} />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0"
                      disabled={disabled}
                      {...form.register(`details.${index}.quantity`, { valueAsNumber: true })}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      disabled={disabled}
                      {...form.register(`details.${index}.unitPrice`, { valueAsNumber: true })}
                    />
                  </TableCell>
                  <TableCell className="text-right text-sm font-medium">
                    {formatCurrency(rowSubtotal, currency)}
                  </TableCell>
                  <TableCell>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={disabled}
                      onClick={() => remove(index)}
                      className="size-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={disabled}
        className="w-fit gap-1.5"
        onClick={() =>
          append({ productServiceId: null, description: '', unit: '', quantity: 1, unitPrice: 0, tax: 0 })
        }
      >
        <Plus className="size-4" />
        Agregar línea
      </Button>

      <div className="ml-auto flex w-full max-w-xs flex-col gap-1 rounded-lg border p-4 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-medium">{formatCurrency(subtotal, currency)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Impuestos</span>
          <span className="font-medium">{formatCurrency(taxTotal, currency)}</span>
        </div>
        <div className="mt-1 flex justify-between border-t pt-1 text-base">
          <span className="font-semibold">Total</span>
          <span className="font-bold">{formatCurrency(total, currency)}</span>
        </div>
      </div>
    </div>
  )
}
