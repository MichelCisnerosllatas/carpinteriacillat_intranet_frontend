// src/features/sales/ui/pos/summary-panel.tsx
'use client'

import Link from 'next/link'
import { CheckCircle2, FileText, Loader2, Package, Save, Send, User, UserCheck } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { IconButton } from '@/shared/ui/icon-button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'
import { Card } from '@/shared/ui/card'
import { cn } from '@/shared/lib/utils'
import { SellerSelect } from '@/features/sellers'
import { useSalePosStore } from '../../stores/useSalePosStore'
import { formatMoney, type CartTotals, type TaxConfig } from '../../lib/sale-pos'
import type { Sale } from '../../data/schema'
import { DocumentNumber } from './document-number'
import { PaymentBox } from './payment-box'
import { TotalsBox } from './totals-box'

interface SummaryPanelProps {
  isEdit: boolean
  documentTypeName: string | null
  documentNumber: { series: string | null; number: string | null }
  totals: CartTotals
  taxConfig: TaxConfig
  paidNow: number
  balance: number
  errorFor: (key: string, prefix?: boolean) => string | undefined
  isSubmitting: boolean
  onEmit: () => void
  /** Solo en edición: guarda sin emitir. */
  onSaveDraft?: () => void
  /** Última venta emitida en esta sesión (reemplaza al modal de éxito). */
  lastSale: Sale | null
  /** true solo con `sales.view_all`: muestra el selector "Vendedor". */
  canChooseSeller: boolean
  /** Vendedor efectivo (el elegido o, por defecto, el usuario de la sesión). */
  sellerId: number | null
}

/**
 * Columna derecha: ficha rápida de la venta, totales, pago y el botón principal.
 * En escritorio es sticky y nunca pasa del alto de la pantalla: el cuerpo hace scroll interno y
 * el pie con "Emitir venta" queda siempre visible. En móvil fluye normal bajo el carrito (el
 * botón vive en la barra inferior fija).
 */
export function SummaryPanel({
  isEdit,
  documentTypeName,
  documentNumber,
  totals,
  taxConfig,
  paidNow,
  balance,
  errorFor,
  isSubmitting,
  onEmit,
  onSaveDraft,
  lastSale,
  canChooseSeller,
  sellerId,
}: SummaryPanelProps) {
  const { client, isGenericClient, lines, currency, setSellerId } = useSalePosStore()
  const units = lines.reduce((acc, l) => acc + (Number(l.quantity) || 0), 0)

  return (
    <Card className="gap-0 overflow-hidden py-0 lg:max-h-[calc(100svh-6rem)]">
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4">
        {/* Ficha rápida: lo que se está por emitir, de un vistazo. */}
        <div className="bg-muted/40 flex flex-col gap-2 rounded-lg p-3 text-sm">
          <div className="flex items-center gap-2">
            <FileText className="text-muted-foreground size-4 shrink-0" />
            <span className="truncate font-medium">{documentTypeName ?? 'Comprobante'}</span>
            <span className="ml-auto shrink-0 text-xs">
              <DocumentNumber {...documentNumber} />
            </span>
          </div>
          <div className="flex items-start gap-2">
            <User className="text-muted-foreground mt-0.5 size-4 shrink-0" />
            {client ? (
              <span className="flex min-w-0 flex-col">
                <span className="truncate">{client.name}</span>
                {client.document && (
                  <span className="text-muted-foreground text-xs">{client.document}</span>
                )}
              </span>
            ) : isGenericClient ? (
              <span>Cliente varios</span>
            ) : (
              <span className="text-muted-foreground italic">Sin cliente</span>
            )}
          </div>
          {/* Vendedor: solo quien ve las ventas de todos puede asignarla a otro (contrato §11). */}
          {canChooseSeller && (
            <div className="flex items-center gap-2">
              <UserCheck className="text-muted-foreground size-4 shrink-0" />
              <SellerSelect
                value={sellerId}
                onValueChange={setSellerId}
                placeholder="Vendedor"
                className="bg-background h-7 text-xs"
              />
            </div>
          )}
          <div className="flex items-center gap-2">
            <Package className="text-muted-foreground size-4 shrink-0" />
            <span className="text-muted-foreground">
              {lines.length} {lines.length === 1 ? 'ítem' : 'ítems'} · {units}{' '}
              {units === 1 ? 'unidad' : 'unidades'}
            </span>
          </div>
        </div>

        <TotalsBox totals={totals} currency={currency} taxConfig={taxConfig} isEdit={isEdit} />

        {/* En edición los pagos se manejan con la sección de pagos de la venta (ver la página). */}
        {!isEdit && (
          <PaymentBox
            total={totals.total}
            currency={currency}
            paidNow={paidNow}
            balance={balance}
            errorFor={errorFor}
          />
        )}
      </div>

      {/* En móvil el pie solo aparece si hay "última venta" que mostrar. */}
      <div className={cn('shrink-0 flex-col gap-2 border-t p-4', lastSale ? 'flex' : 'hidden lg:flex')}>
        {/* En móvil el botón principal vive en la barra inferior fija (ver mobile-total-bar). */}
        <div className="hidden gap-2 lg:flex">
          {/* Excepción aprobada: el botón principal lleva ícono + texto (aquí siempre es ≥ lg). */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                size="lg"
                className="flex-1"
                disabled={isSubmitting}
                onClick={onEmit}
              >
                {isSubmitting ? <Loader2 className="animate-spin" /> : <Send />}
                Emitir venta
              </Button>
            </TooltipTrigger>
            <TooltipContent>Ctrl+Enter</TooltipContent>
          </Tooltip>
          {onSaveDraft && (
            <IconButton
              label="Guardar cambios sin emitir"
              className="size-10"
              disabled={isSubmitting}
              onClick={onSaveDraft}
              icon={<Save />}
            />
          )}
        </div>

        {lastSale && (
          <div className="flex items-center gap-2 rounded-md border border-teal-600/30 bg-teal-600/5 px-3 py-2 text-xs">
            <CheckCircle2 className="size-4 shrink-0 text-teal-600" />
            <span className="min-w-0 flex-1 truncate">
              <span className="text-muted-foreground">Última: </span>
              <span className="font-medium">{lastSale.code}</span>
              {' · '}
              <span className="tabular-nums">{formatMoney(lastSale.total, lastSale.currency)}</span>
              {lastSale.balance > 0 && (
                <span className="text-orange-600 dark:text-orange-400">
                  {' · '}Saldo {formatMoney(lastSale.balance, lastSale.currency)}
                </span>
              )}
            </span>
            <Link
              href={`/sales/${lastSale.id}`}
              className="text-primary shrink-0 font-medium hover:underline"
            >
              Ver
            </Link>
          </div>
        )}
      </div>
    </Card>
  )
}
