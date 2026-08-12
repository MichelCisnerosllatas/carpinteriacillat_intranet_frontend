// src/features/sales/ui/form/sale-form/header-section.tsx
'use client'

import Link from 'next/link'
import { CheckCircle2, Info } from 'lucide-react'
import { Input } from '@/shared/ui/input'
import { Textarea } from '@/shared/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/ui/form'
import { SaleDocumentTypeSelect } from '@/features/sale-document-types'
import { ClientSelect } from '@/features/clients'
import type { SaleSetting } from '@/features/sale-settings'
import { SALE_CURRENCIES } from '../../../data/data'
import type { Sale } from '../../../data/schema'
import type { UseFormReturn } from 'react-hook-form'
import type { SaleFormValues } from '../../../lib/sale-form'

interface HeaderSectionProps {
  form: UseFormReturn<SaleFormValues>
  isEdit: boolean
  saleId: number | null
  /** Venta ya resuelta en edición — se usa solo para mostrar los campos de solo lectura
   * (código/serie/correlativo, IGV aplicado) que no forman parte del formulario. */
  sale: Sale | null
  isManualSaving: boolean
  /** Configuración de ventas vigente — la trae `sale-form.tsx` (una sola vez, se comparte con el
   * carrito para proyectar el IGV de los pendientes) SOLO para mostrar en vivo qué resuelve "Usar
   * configuración por defecto". Es puramente informativo: el servidor es quien decide de verdad
   * al crear (POST /sales sin `is_taxed`). Si esto muestra algo distinto a lo que termina
   * aplicando la venta creada, el problema está en el backend, no en este formulario. */
  settings: SaleSetting | null
  settingsLoaded: boolean
}

/** Card "Cabecera" — cliente, tipo de comprobante y fechas. `series`/`correlative`/`code` NUNCA
 * se editan acá (siempre los genera el servidor, ver sales.md) — en edición se muestran como
 * texto informativo, igual que `is_taxed`/`igv_rate_applied` (inmutables tras crear). */
export function HeaderSection({
  form,
  isEdit,
  saleId,
  sale,
  isManualSaving,
  settings,
  settingsLoaded,
}: HeaderSectionProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-1.5">
          Cabecera
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="text-muted-foreground size-3.5" />
            </TooltipTrigger>
            <TooltipContent>
              Datos generales de la venta — cliente, tipo de comprobante y fechas.
            </TooltipContent>
          </Tooltip>
        </CardTitle>
        {!isEdit && saleId && (
          <span className="text-muted-foreground flex items-center gap-1.5 text-xs">
            <CheckCircle2 className="size-3.5 text-teal-600" />
            Venta registrada — puedes seguir agregando líneas
          </span>
        )}
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {/* El IGV NO es un campo de este formulario — se controla en un solo lugar
         * (Configuración de Ventas). Acá solo se informa qué va a aplicar (o qué aplicó, en
         * edición), de solo lectura. */}
        {isEdit && sale && (
          <div className="bg-muted/40 flex flex-wrap items-center gap-x-4 gap-y-1 rounded-lg border px-3 py-2 text-xs">
            <span>
              Código: <span className="font-medium">{sale.code}</span>
            </span>
            <span>
              {sale.isTaxed
                ? `Grava IGV — tasa aplicada: ${sale.igvRateApplied ?? 0}%`
                : 'No grava IGV'}
            </span>
          </div>
        )}
        {!isEdit && (
          <div className="bg-muted/40 flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs">
            <Info className="text-muted-foreground size-3.5 shrink-0" />
            {!settingsLoaded ? (
              'Consultando la configuración de IGV vigente...'
            ) : settings?.igvEnabledDefaultBool ? (
              <span>
                Esta venta gravará IGV al <span className="font-medium">{settings.igvRate}%</span>, según{' '}
                <Link href="/sale-settings" className="text-primary hover:underline">
                  Configuración de Ventas
                </Link>
                .
              </span>
            ) : (
              <span>
                Esta venta NO gravará IGV, según{' '}
                <Link href="/sale-settings" className="text-primary hover:underline">
                  Configuración de Ventas
                </Link>
                .
              </span>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-5">
          <FormField
            control={form.control}
            name="client_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cliente</FormLabel>
                <ClientSelect
                  value={field.value ?? null}
                  onValueChange={field.onChange}
                  disabled={isManualSaving}
                />
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="sale_document_type_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Tipo de comprobante <span className="text-destructive">*</span>
                </FormLabel>
                <SaleDocumentTypeSelect
                  value={field.value ?? null}
                  onValueChange={field.onChange}
                  disabled={isManualSaving}
                />
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="issue_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Fecha de emisión <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input type="date" disabled={isManualSaving} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="payment_method"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Forma de pago</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: Contado" disabled={isManualSaving} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="currency"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-1.5">
                  Moneda
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="text-muted-foreground size-3.5" />
                    </TooltipTrigger>
                    <TooltipContent>
                      Texto libre — escribe el código o elige una sugerencia (PEN, USD).
                    </TooltipContent>
                  </Tooltip>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="PEN"
                    className="uppercase"
                    list="sale-currencies"
                    disabled={isManualSaving}
                    {...field}
                  />
                </FormControl>
                <datalist id="sale-currencies">
                  {SALE_CURRENCIES.map((c) => (
                    <option key={c.value} value={c.value} />
                  ))}
                </datalist>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="observation"
            render={({ field }) => (
              <FormItem className="col-span-2 lg:col-span-3 xl:col-span-5">
                <FormLabel>Observación</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Observaciones opcionales"
                    className="resize-none"
                    rows={3}
                    disabled={isManualSaving}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  )
}
