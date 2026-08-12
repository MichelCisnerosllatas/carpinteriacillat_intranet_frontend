// src/features/sales/ui/form/sale-form/sale-form.tsx
'use client'

import { useEffect } from 'react'
import { Info, Loader2 } from 'lucide-react'
import { Separator } from '@/shared/ui/separator'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'
import { Form } from '@/shared/ui/form'
import { Button } from '@/shared/ui/button'
import { AlertError } from '@/widgets/alerts_components'
import { useSaleSettingStore } from '@/features/sale-settings'
import { SalePaymentsSection } from '@/features/sale-payments'
import { useSaleForm } from '../../../hooks'
import { SaleDetailLines } from '../sale-detail-lines'
import { PendingPaymentsCard } from '../pending-payments-card'
import { HeaderSection } from './header-section'

export function SaleForm({ mode, id }: { mode: 'create' | 'edit'; id?: string }) {
  const {
    form,
    isEdit,
    saleId,
    resolved,
    isManualSaving,
    setLineCount,
    cartError,
    error,
    fieldErrors,
    onSubmit,
    onInvalid,
    goToList,
    isLoadingSale,
    saleLoadError,
  } = useSaleForm(mode, id)

  // La configuración de ventas se trae UNA sola vez acá — se comparte con `HeaderSection` (solo
  // para mostrar en vivo qué va a aplicar) y con el carrito, que la usa para proyectar el IGV de
  // los productos pendientes. No hace falta en edición: ahí `is_taxed`/`igv_rate_applied` ya
  // vienen fijos en la propia venta. El IGV NO es un campo de este formulario — se decide 100%
  // en Configuración de Ventas, sin excepción por venta (decisión de producto).
  const { data: settings, hasLoaded: settingsLoaded, fetch: fetchSettings } = useSaleSettingStore()
  useEffect(() => {
    if (!isEdit) void fetchSettings()
  }, [isEdit])

  // `willBeTaxed`: true/false en cuanto se sabe la respuesta, `null` mientras no se sabe todavía
  // (config. de ventas cargando). En edición ya es un hecho consumado: `sale.isTaxed`.
  const willBeTaxed = isEdit && resolved ? resolved.isTaxed : settingsLoaded ? settings?.igvEnabledDefaultBool ?? null : null

  const igvRate = isEdit && resolved ? resolved.igvRateApplied ?? 0 : settings?.igvRate ?? 0

  if (isLoadingSale) {
    return (
      <div className="text-muted-foreground flex flex-col items-center justify-center gap-2 py-20">
        <Loader2 className="size-6 animate-spin" />
        <p className="text-sm">Cargando venta...</p>
      </div>
    )
  }

  if (saleLoadError) {
    return <AlertError title="No se pudo cargar la venta" message={saleLoadError} />
  }

  // Solo se puede editar el carrito mientras la venta está GUARDADA (ver sale-details.md) — al
  // crear siempre es editable, porque la venta nace en GUARDADA (`resolved` sigue null hasta que
  // se edite una venta ya existente).
  const linesReadOnly = isEdit ? Boolean(resolved) && resolved!.status !== 'GUARDADA' : false

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit, onInvalid)} className="flex flex-col gap-4">
        <HeaderSection
          form={form}
          isEdit={isEdit}
          saleId={saleId}
          sale={resolved}
          isManualSaving={isManualSaving}
          settings={settings}
          settingsLoaded={settingsLoaded}
        />

        {/* Cobros (adelantos) — chica y compacta a propósito ("visible pero no tanto"), entre la
         * cabecera y el carrito. En creación NO hace falta esperar a que la venta exista: el
         * usuario carga el/los adelantos ya mismo (`PendingPaymentsCard`, en memoria) y se suben
         * solos al registrar (`uploadPendingPayments`, después de las líneas del carrito — el
         * saldo contra el que se valida un pago depende del total, que recién se conoce con los
         * ítems ya guardados). En edición la venta ya existe, así que es el `SalePaymentsSection`
         * real (mismo que en el detalle de solo lectura). */}
        {isEdit && resolved ? (
          <SalePaymentsSection
            saleId={resolved.id}
            readOnly={resolved.status === 'ANULADA'}
            amountPaid={resolved.amountPaid}
            balance={resolved.balance}
            currency={resolved.currency}
          />
        ) : (
          <PendingPaymentsCard currency={form.watch('currency') || 'PEN'} />
        )}

        <Card className={cartError ? 'border-destructive/50' : undefined}>
          <CardHeader>
            <CardTitle className="flex items-center gap-1.5">
              Carrito
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="text-muted-foreground size-3.5" />
                </TooltipTrigger>
                <TooltipContent>
                  Puedes ir agregando productos ya mismo — se guardan solos en cuanto registres la
                  venta.
                </TooltipContent>
              </Tooltip>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SaleDetailLines
              saleId={saleId}
              currency={form.watch('currency') || 'PEN'}
              onCountChange={setLineCount}
              cartError={cartError}
              readOnly={linesReadOnly}
              taxPreview={{ willBeTaxed, rate: igvRate }}
            />
          </CardContent>
        </Card>

        <Separator />
        {error && (
          <AlertError
            title={isEdit ? 'Error al actualizar' : 'Error al crear'}
            message={error}
            apiError={fieldErrors ? { errors: fieldErrors } : undefined}
          />
        )}

        {/* Botones Cancelar/Finalizar y Registrar/Guardar cambios, al pie del formulario. */}
        <div className="flex items-center justify-end gap-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button type="button" variant="outline" onClick={goToList} disabled={isManualSaving}>
                {saleId ? 'Finalizar' : 'Cancelar'}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {saleId
                ? 'Ya está registrada — vuelve al listado de ventas.'
                : 'Sale sin registrar nada — todavía no se guardó ningún dato.'}
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button type="submit" disabled={isManualSaving} className="min-w-28">
                {isManualSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {saleId ? 'Guardando...' : 'Registrando...'}
                  </>
                ) : saleId ? (
                  'Guardar cambios'
                ) : (
                  'Registrar'
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {saleId
                ? 'Actualiza los datos de la cabecera.'
                : 'Registra la venta en estado GUARDADA y sube las líneas del carrito.'}
            </TooltipContent>
          </Tooltip>
        </div>
      </form>
    </Form>
  )
}
