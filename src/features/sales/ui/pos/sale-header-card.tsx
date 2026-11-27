// src/features/sales/ui/pos/sale-header-card.tsx
'use client'

import type { ReactNode } from 'react'
import { Card, CardContent } from '@/shared/ui/card'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { useSalePosStore } from '../../stores/useSalePosStore'
import type { SaleFormDataDocumentTypeDto, SaleFormDataOptionDto } from '../../model/saleformdata.dto'
import { DocumentNumber } from './document-number'
import { FieldError } from './field-error'

interface SaleHeaderCardProps {
  documentTypes: SaleFormDataDocumentTypeDto[]
  currencies: SaleFormDataOptionDto[]
  onSelectDocumentType: (id: number) => void
  documentNumber: { series: string | null; number: string | null }
  errorFor: (key: string, prefix?: boolean) => string | undefined
  /** Campo cliente (con su lupa y el botón de proforma) — lo arma la página. */
  clientSlot: ReactNode
  /** Chip "Desde proforma ..." cuando aplica. */
  proformaSlot?: ReactNode
}

/**
 * Cabecera del comprobante: tipo, serie-N°, fecha, moneda y cliente. Va ANTES del carrito porque
 * son los datos que definen la venta; así el resumen de la derecha queda solo para números y pago.
 */
export function SaleHeaderCard({
  documentTypes,
  currencies,
  onSelectDocumentType,
  documentNumber,
  errorFor,
  clientSlot,
  proformaSlot,
}: SaleHeaderCardProps) {
  const { documentTypeId, issueDate, currency, setIssueDate, setCurrency } = useSalePosStore()

  return (
    <Card className="py-4">
      <CardContent className="flex flex-col gap-4 px-4 sm:px-6">
        {/* Móvil: 2 columnas (comprobante + N°, fecha + moneda). Desde md: todo en una fila. */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.9fr)]">
          <div className="flex min-w-0 flex-col gap-1.5">
            <Label>Comprobante</Label>
            <Select
              value={documentTypeId ? String(documentTypeId) : ''}
              onValueChange={(v) => onSelectDocumentType(Number(v))}
            >
              <SelectTrigger className="w-full" aria-invalid={Boolean(errorFor('sale_document_type_id')) || undefined}>
                <SelectValue placeholder="Elegir..." />
              </SelectTrigger>
              <SelectContent>
                {documentTypes.map((t) => (
                  <SelectItem key={t.id} value={String(t.id)}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError message={errorFor('sale_document_type_id')} />
          </div>

          <div className="flex min-w-0 flex-col gap-1.5">
            <Label>Serie - N°</Label>
            <div className="bg-muted/50 flex h-9 items-center rounded-md border px-3 text-sm">
              <DocumentNumber {...documentNumber} />
            </div>
          </div>

          <div className="flex min-w-0 flex-col gap-1.5">
            <Label htmlFor="pos-date">Fecha</Label>
            <Input
              id="pos-date"
              type="date"
              value={issueDate}
              aria-invalid={Boolean(errorFor('issue_date')) || undefined}
              onChange={(e) => setIssueDate(e.target.value)}
            />
            <FieldError message={errorFor('issue_date')} />
          </div>

          <div className="flex min-w-0 flex-col gap-1.5">
            <Label>Moneda</Label>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError message={errorFor('currency')} />
          </div>
        </div>

        {clientSlot}
        {proformaSlot}
      </CardContent>
    </Card>
  )
}
