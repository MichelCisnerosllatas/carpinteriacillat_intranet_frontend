// src/features/proformas/ui/form/proforma-detail-lines.tsx
'use client'

import { useEffect, useState } from 'react'
import { Check, Loader2, Plus, Trash2, X } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'
import { ProductServiceSelect, useProductServiceSelectStore } from '@/features/products-services'
import {
  useProformaDetailListStore,
  useProformaDetailFormStore,
  useProformaDetailDeleteStore,
  type ProformaDetail,
} from '@/features/proforma-details'
import { swalDeleteConfirm } from '@/shared/lib/swal'
import { toastError, toastSuccess } from '@/shared/lib/toast'

interface ProformaDetailLinesProps {
  proformaId: number | null
  currency: string
  disabled?: boolean
}

type DraftLine = {
  productServiceId: number | null
  description: string
  unit: string
  quantity: number
  unitPrice: number
  tax: number
}

const emptyDraft: DraftLine = {
  productServiceId: null, description: '', unit: '', quantity: 1, unitPrice: 0, tax: 0,
}

const formatCurrency = (value: number, currency: string) =>
  `${currency} ${Number.isFinite(value) ? value.toFixed(2) : '0.00'}`

export function ProformaDetailLines({ proformaId, currency, disabled }: ProformaDetailLinesProps) {
  const { items, isFetching, loadByProforma, reset: resetList } = useProformaDetailListStore()
  const { create, update, isSubmitting } = useProformaDetailFormStore()
  const { deleteItem, isLoading: isDeleting } = useProformaDetailDeleteStore()
  const { options: productServiceOptions, load: loadProductServices } = useProductServiceSelectStore()

  const [draft, setDraft] = useState<DraftLine>(emptyDraft)
  const [edits, setEdits] = useState<Record<number, DraftLine>>({})
  const [savingRowId, setSavingRowId] = useState<number | null>(null)
  const [deletingRowId, setDeletingRowId] = useState<number | null>(null)

  useEffect(() => { void loadProductServices() }, [])

  useEffect(() => {
    if (proformaId) void loadByProforma(proformaId)
    return () => resetList()
  }, [proformaId])

  if (!proformaId) {
    return (
      <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
        Completa los datos obligatorios de la cabecera (cliente, tipo, plantilla, firma y fecha) para habilitar las líneas de detalle.
      </div>
    )
  }

  const subtotal = items.reduce((acc, d) => acc + d.subtotal, 0)
  const taxTotal = items.reduce((acc, d) => acc + (d.tax ?? 0), 0)
  const total = items.reduce((acc, d) => acc + d.total, 0)

  const rowValue = (row: ProformaDetail): DraftLine =>
    edits[row.id] ?? {
      productServiceId: row.productServiceId,
      description: row.description,
      unit: row.unit ?? '',
      quantity: row.quantity,
      unitPrice: row.unitPrice,
      tax: row.tax ?? 0,
    }

  const setRowField = (row: ProformaDetail, field: keyof DraftLine, value: DraftLine[keyof DraftLine]) => {
    setEdits((prev) => ({ ...prev, [row.id]: { ...rowValue(row), [field]: value } }))
  }

  const clearRowEdits = (id: number) => {
    setEdits((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
  }

  const handleSaveRow = async (row: ProformaDetail) => {
    const values = rowValue(row)
    setSavingRowId(row.id)
    try {
      const ok = await update(row.id, {
        proforma_id: proformaId,
        product_service_id: values.productServiceId ?? undefined,
        description: values.description,
        unit: values.unit || undefined,
        quantity: values.quantity,
        unit_price: values.unitPrice,
        tax: values.tax,
      })
      if (ok) {
        toastSuccess('Línea actualizada', values.description)
        clearRowEdits(row.id)
      } else {
        toastError('Error', 'No se pudo actualizar la línea.')
      }
    } finally {
      setSavingRowId(null)
    }
  }

  const handleDeleteRow = async (row: ProformaDetail) => {
    await swalDeleteConfirm(
      `¿Eliminar la línea "${row.description}"?`, 'Esta acción no se puede deshacer.',
      async ({ close, showError }) => {
        setDeletingRowId(row.id)
        const ok = await deleteItem(row.id, proformaId)
        setDeletingRowId(null)
        if (ok) {
          toastSuccess('Línea eliminada', row.description)
          close()
        } else {
          showError('No se pudo eliminar la línea.')
        }
      },
      { title: 'Eliminando...' }
    )
  }

  const handleAddLine = async () => {
    if (!draft.description.trim()) {
      toastError('Falta la descripción', 'Escribe una descripción para la línea.')
      return
    }
    const ok = await create({
      proforma_id: proformaId,
      product_service_id: draft.productServiceId ?? undefined,
      description: draft.description,
      unit: draft.unit || undefined,
      quantity: draft.quantity,
      unit_price: draft.unitPrice,
      tax: draft.tax,
    })
    if (ok) {
      toastSuccess('Línea agregada', draft.description)
      setDraft(emptyDraft)
    } else {
      toastError('Error', 'No se pudo agregar la línea.')
    }
  }

  const isBusy = disabled || isSubmitting

  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[200px]">Producto/Servicio</TableHead>
              <TableHead className="min-w-[200px]">Descripción</TableHead>
              <TableHead className="w-[90px]">Unidad</TableHead>
              <TableHead className="w-[100px]">Cantidad</TableHead>
              <TableHead className="w-[120px]">P. Unitario</TableHead>
              <TableHead className="w-[120px] text-right">Total</TableHead>
              <TableHead className="w-[88px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isFetching && items.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="h-20 text-center text-sm text-muted-foreground">
                  <Loader2 className="mx-auto mb-1 size-4 animate-spin" />
                  Cargando líneas...
                </TableCell>
              </TableRow>
            )}
            {!isFetching && items.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-muted-foreground h-20 text-center text-sm">
                  Sin líneas. Agrega al menos una para detallar la proforma.
                </TableCell>
              </TableRow>
            )}
            {items.map((row) => {
              const values = rowValue(row)
              const isDirty = Boolean(edits[row.id])
              const rowTotal = values.quantity * values.unitPrice + values.tax
              const isRowBusy = isBusy || savingRowId === row.id || deletingRowId === row.id
              return (
                <TableRow key={row.id}>
                  <TableCell>
                    <ProductServiceSelect
                      value={values.productServiceId}
                      disabled={isRowBusy}
                      onValueChange={(id) => {
                        const picked = productServiceOptions.find((o) => o.id === id)
                        setEdits((prev) => ({
                          ...prev,
                          [row.id]: {
                            ...rowValue(row),
                            productServiceId: id,
                            description: picked && !values.description ? picked.name : values.description,
                            unit: picked?.unit ?? values.unit,
                            unitPrice: picked ? Number(picked.default_price) : values.unitPrice,
                          },
                        }))
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={values.description}
                      disabled={isRowBusy}
                      onChange={(e) => setRowField(row, 'description', e.target.value)}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={values.unit}
                      disabled={isRowBusy}
                      onChange={(e) => setRowField(row, 'unit', e.target.value)}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number" step="0.01" min="0"
                      value={values.quantity}
                      disabled={isRowBusy}
                      onChange={(e) => setRowField(row, 'quantity', Number(e.target.value))}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number" step="0.01" min="0"
                      value={values.unitPrice}
                      disabled={isRowBusy}
                      onChange={(e) => setRowField(row, 'unitPrice', Number(e.target.value))}
                    />
                  </TableCell>
                  <TableCell className="text-right text-sm font-medium">
                    {formatCurrency(rowTotal, currency)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      {isDirty && (
                        <>
                          <Button
                            type="button" variant="ghost" size="icon" disabled={isRowBusy}
                            onClick={() => handleSaveRow(row)}
                            className="text-teal-600 hover:bg-teal-500/10 hover:text-teal-600 size-8"
                          >
                            {savingRowId === row.id ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
                          </Button>
                          <Button
                            type="button" variant="ghost" size="icon" disabled={isRowBusy}
                            onClick={() => clearRowEdits(row.id)}
                            className="size-8"
                          >
                            <X className="size-4" />
                          </Button>
                        </>
                      )}
                      {!isDirty && (
                        <Button
                          type="button" variant="ghost" size="icon" disabled={isRowBusy}
                          onClick={() => handleDeleteRow(row)}
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive size-8"
                        >
                          {deletingRowId === row.id ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
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

      <div className="flex flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-end sm:gap-2">
        <div className="grid flex-1 grid-cols-2 gap-2 sm:grid-cols-5">
          <div className="col-span-2 sm:col-span-1">
            <ProductServiceSelect
              value={draft.productServiceId}
              disabled={isBusy}
              onValueChange={(id) => {
                const picked = productServiceOptions.find((o) => o.id === id)
                setDraft((prev) => ({
                  ...prev,
                  productServiceId: id,
                  description: picked && !prev.description ? picked.name : prev.description,
                  unit: picked?.unit ?? prev.unit,
                  unitPrice: picked ? Number(picked.default_price) : prev.unitPrice,
                }))
              }}
            />
          </div>
          <Input
            placeholder="Descripción" disabled={isBusy}
            value={draft.description}
            onChange={(e) => setDraft((p) => ({ ...p, description: e.target.value }))}
          />
          <Input
            placeholder="Unidad" disabled={isBusy}
            value={draft.unit}
            onChange={(e) => setDraft((p) => ({ ...p, unit: e.target.value }))}
          />
          <Input
            type="number" step="0.01" min="0" placeholder="Cant." disabled={isBusy}
            value={draft.quantity}
            onChange={(e) => setDraft((p) => ({ ...p, quantity: Number(e.target.value) }))}
          />
          <Input
            type="number" step="0.01" min="0" placeholder="P. Unit." disabled={isBusy}
            value={draft.unitPrice}
            onChange={(e) => setDraft((p) => ({ ...p, unitPrice: Number(e.target.value) }))}
          />
        </div>
        <Button type="button" size="sm" disabled={isBusy} className="gap-1.5" onClick={handleAddLine}>
          {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
          Agregar línea
        </Button>
      </div>

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
