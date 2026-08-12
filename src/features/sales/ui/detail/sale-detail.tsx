// src/features/sales/ui/detail/sale-detail.tsx
'use client'

import { CalendarDays, FileText, Package, User } from 'lucide-react'
import { Skeleton } from '@/shared/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'
import { cn } from '@/shared/lib/utils'
import { SalePaymentsSection } from '@/features/sale-payments'
import { useSaleDetailPage } from '../../hooks'
import { formatSaleCurrency } from '../../data/data'
import { SaleDetailHero } from './sale-detail-hero'

/**
 * Vista de solo lectura. A diferencia de `proforma-detail.tsx`, no hay pestañas — sales no
 * tiene motor de PDF, así que todo el resumen (cabecera, ítems, totales, cobros) vive en una
 * sola columna de cards. Ninguna acción de aquí muta datos (eso vive en `sales-row-actions.tsx`
 * y, para pagos, en el CRUD de `sale-payments`).
 */
export function SaleDetail({ id }: { id: string }) {
  const { item, isFetching, handleRefresh } = useSaleDetailPage(id)

  if (!item) {
    return (
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-3">
        <Skeleton className="h-16 w-full rounded-xl" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-3">
      <SaleDetailHero item={item} isRefreshing={isFetching} onRefresh={() => void handleRefresh()} />

      {/* Cliente / emisión / documento — franja compacta, secundaria */}
      <Card className="overflow-hidden py-0">
        <CardContent className="grid grid-cols-1 divide-y p-0 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          <div className="flex flex-col gap-1.5 p-3">
            <span className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium">
              <User className="size-3.5" />
              Cliente
            </span>
            <span className="text-sm font-medium">{item.clientBusinessName ?? '—'}</span>
          </div>

          <div className="flex flex-col gap-1.5 p-3">
            <span className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium">
              <CalendarDays className="size-3.5" />
              Emisión
            </span>
            <span className="text-muted-foreground text-xs">
              {item.issueDateFormatted ?? item.issueDate}
            </span>
            {item.paymentMethod && (
              <span className="text-muted-foreground text-xs">Forma de pago: {item.paymentMethod}</span>
            )}
            <span className="text-muted-foreground text-xs">Moneda: {item.currency}</span>
          </div>

          <div className="flex flex-col gap-1.5 p-3">
            <span className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium">
              <FileText className="size-3.5" />
              Documento
            </span>
            <span className="text-muted-foreground text-xs">
              {item.saleDocumentTypeName ?? '—'} · {item.series}-{item.correlative}
            </span>
            <span className="text-muted-foreground text-xs">
              {item.isTaxed ? `Grava IGV (${item.igvRateApplied ?? 0}%)` : 'No grava IGV'}
            </span>
          </div>
        </CardContent>
      </Card>

      {item.observation && (
        <Card className="gap-2 py-3">
          <CardHeader className="px-4 pb-0">
            <CardTitle className="text-sm">Observación</CardTitle>
          </CardHeader>
          <CardContent className="px-4">
            <p className="text-muted-foreground text-sm">{item.observation}</p>
          </CardContent>
        </Card>
      )}

      {/* Productos y servicios */}
      <Card className="gap-3 py-4">
        <CardHeader className="flex flex-row items-center justify-between px-4 pb-0">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Package className="size-4" />
            Productos y servicios
          </CardTitle>
          {item.details.length > 0 && (
            <span className="text-muted-foreground text-xs">{item.details.length} ítem(s)</span>
          )}
        </CardHeader>
        <CardContent className="px-4">
          {item.details.length === 0 ? (
            <div className="flex flex-col items-center gap-1 rounded-lg border border-dashed py-8 text-center">
              <Package className="text-muted-foreground/50 mb-2 size-8" />
              <p className="text-sm font-medium">Esta venta no tiene líneas de detalle</p>
              <p className="text-muted-foreground text-xs">
                Para agregarlas, edítala desde el listado de ventas (solo mientras esté Guardada).
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-[36px]">#</TableHead>
                    <TableHead className="min-w-[200px]">Descripción</TableHead>
                    <TableHead className="w-[70px]">Unidad</TableHead>
                    <TableHead className="w-[90px] text-right">Cantidad</TableHead>
                    <TableHead className="w-[110px] text-right">P. Unitario</TableHead>
                    <TableHead className="w-[110px] text-right">Subtotal</TableHead>
                    <TableHead className="w-[100px] text-right">IGV</TableHead>
                    <TableHead className="w-[110px] text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {item.details.map((d, i) => (
                    <TableRow key={d.id} className={cn(i % 2 === 1 && 'bg-muted/20')}>
                      <TableCell className="text-muted-foreground text-xs">{i + 1}</TableCell>
                      <TableCell className="text-sm font-medium">{d.description}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{d.unit ?? '—'}</TableCell>
                      <TableCell className="text-right text-sm tabular-nums">{d.quantity}</TableCell>
                      <TableCell className="text-right text-sm tabular-nums">
                        {formatSaleCurrency(d.unitPrice, item.currency)}
                      </TableCell>
                      <TableCell className="text-right text-sm tabular-nums">
                        {formatSaleCurrency(d.subtotal, item.currency)}
                      </TableCell>
                      <TableCell className="text-right text-sm tabular-nums">
                        {formatSaleCurrency(d.tax ?? 0, item.currency)}
                      </TableCell>
                      <TableCell className="text-right text-sm font-medium tabular-nums">
                        {formatSaleCurrency(d.total, item.currency)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          <div className="mt-3 ml-auto flex w-full max-w-xs flex-col gap-1 rounded-lg border p-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">{formatSaleCurrency(item.subtotal, item.currency)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">IGV</span>
              <span className="font-medium">{formatSaleCurrency(item.tax, item.currency)}</span>
            </div>
            <div className="mt-1 flex justify-between border-t pt-1 text-lg">
              <span className="font-semibold">Total</span>
              <span className="font-bold">{formatSaleCurrency(item.total, item.currency)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cobros — CRUD interactivo de pagos/adelantos (ver features/sale-payments). Solo se
       * bloquea si la venta está ANULADA — a diferencia de las líneas de detalle, sigue editable
       * en EMITIDA (ver «Conceptos clave» en sale-payments.md). */}
      <SalePaymentsSection
        saleId={item.id}
        readOnly={item.status === 'ANULADA'}
        amountPaid={item.amountPaid}
        balance={item.balance}
        currency={item.currency}
      />
    </div>
  )
}
