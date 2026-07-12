// src/features/proformas/ui/detail/proforma-summary-tab.tsx
'use client'

import { Building2, CalendarDays, Clock, FileText, Landmark, MapPin, Package, PenTool, User } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { formatProformaCurrency } from '../../data/data'
import type { Proforma } from '../../data/schema'

interface ProformaSummaryTabProps {
  item: Proforma
}

export function ProformaSummaryTab({ item }: ProformaSummaryTabProps) {
  return (
    <div className="flex flex-col gap-3">
      {/* Cliente / emisión / plantilla — franja compacta, secundaria */}
      <Card className="overflow-hidden py-0">
        <CardContent className="grid grid-cols-1 divide-y p-0 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          <div className="flex flex-col gap-1.5 p-3">
            <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground"><User className="size-3.5" />Cliente</span>
            <span className="text-sm font-medium">{item.clientName ?? item.clientBusinessName ?? '—'}</span>
            {item.clientDocument && <span className="text-xs text-muted-foreground">Doc: {item.clientDocument}</span>}
            {item.clientAddress && <span className="flex items-start gap-1 text-xs text-muted-foreground"><Building2 className="mt-0.5 size-3 shrink-0" />{item.clientAddress}</span>}
            {item.clientAttention && <span className="text-xs text-muted-foreground">Atención: {item.clientAttention}</span>}
          </div>

          <div className="flex flex-col gap-1.5 p-3">
            <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground"><CalendarDays className="size-3.5" />Emisión</span>
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><MapPin className="size-3.5" />{item.placeOfIssue ?? '—'}</span>
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><Clock className="size-3.5" />Plazo: {item.deliveryTime ?? '—'}</span>
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><Landmark className="size-3.5" />Moneda: {item.currency}</span>
          </div>

          <div className="flex flex-col gap-1.5 p-3">
            <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground"><FileText className="size-3.5" />Documento</span>
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><FileText className="size-3.5" />Plantilla: {item.templateName ?? '—'}</span>
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><PenTool className="size-3.5" />Firma: {item.signerName ?? '—'}</span>
          </div>
        </CardContent>
      </Card>

      {item.observation && (
        <Card className="gap-2 py-3">
          <CardHeader className="px-4 pb-0">
            <CardTitle className="text-sm">Observación</CardTitle>
          </CardHeader>
          <CardContent className="px-4">
            <p className="text-sm text-muted-foreground">{item.observation}</p>
          </CardContent>
        </Card>
      )}

      
      {/* Productos y servicios — lo primero que interesa al usuario */}
      <Card className="gap-3 py-4">
        <CardHeader className="flex flex-row items-center justify-between px-4 pb-0">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Package className="size-4" />
            Productos y servicios
          </CardTitle>
          {item.details.length > 0 && (
            <span className="text-xs text-muted-foreground">{item.details.length} ítem(s)</span>
          )}
        </CardHeader>
        <CardContent className="px-4">
          {item.details.length === 0 ? (
            <div className="flex flex-col items-center gap-1 rounded-lg border border-dashed py-8 text-center">
              <Package className="mb-2 size-8 text-muted-foreground/50" />
              <p className="text-sm font-medium">Esta proforma no tiene líneas de detalle</p>
              <p className="text-xs text-muted-foreground">Para agregarlas, edítala desde el listado de proformas.</p>
            </div>
          ) : (
            <div className="flex flex-col divide-y">
              {item.details.map((d, i) => (
                <div key={d.id} className="flex items-start justify-between gap-3 py-2">
                  <div className="flex items-start gap-2.5">
                    <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-medium text-muted-foreground">
                      {i + 1}
                    </span>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium leading-tight">{d.description}</span>
                      <span className="text-xs text-muted-foreground">
                        {d.quantity} {d.unit ?? ''} × {formatProformaCurrency(d.unitPrice, item.currency)}
                      </span>
                    </div>
                  </div>
                  <span className="shrink-0 text-sm font-medium tabular-nums">
                    {formatProformaCurrency(d.total, item.currency)}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="mt-3 ml-auto flex w-full max-w-xs flex-col gap-1 rounded-lg border p-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">{formatProformaCurrency(item.subtotal, item.currency)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Impuestos</span>
              <span className="font-medium">{formatProformaCurrency(item.tax, item.currency)}</span>
            </div>
            <div className="mt-1 flex justify-between border-t pt-1 text-lg">
              <span className="font-semibold">Total</span>
              <span className="font-bold">{formatProformaCurrency(item.total, item.currency)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
