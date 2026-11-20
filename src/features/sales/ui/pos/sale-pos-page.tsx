// src/features/sales/ui/pos/sale-pos-page.tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import { FileDown, Loader2 } from 'lucide-react'
import { Card, CardContent } from '@/shared/ui/card'
import { IconButton } from '@/shared/ui/icon-button'
import { AlertError } from '@/widgets/alerts_components'
import { SalePaymentsSection } from '@/features/sale-payments'
import { useSalePos, useSalePosShortcuts } from '../../hooks'
import { useSalePosStore } from '../../stores/useSalePosStore'
import { CartTable } from './cart-table'
import { ClientField } from './client-field'
import { MobileTotalBar } from './mobile-total-bar'
import { ProductSearchField } from './product-search-field'
import { ProformaChip } from './proforma-chip'
import { ProformaImportModal } from './proforma-import-modal'
import { SaleHeaderCard } from './sale-header-card'
import { SaleNoteField } from './sale-note-field'
import { ShortcutsHint } from './shortcuts-hint'
import { SummaryPanel } from './summary-panel'

interface SalePosPageProps {
  mode: 'create' | 'edit'
  id?: string
  /** `/sales/create?proforma={id}` — precarga esa proforma al entrar. */
  proformaId?: number | null
}

/**
 * Pantalla "Realizar venta" tipo caja.
 * Izquierda: cabecera del comprobante (tipo, serie-N°, fecha, moneda, cliente) y el carrito.
 * Derecha: resumen sticky (solo escritorio) con ficha rápida, totales, pago y "Emitir venta".
 * Al emitir: modal de confirmación → toast (con "Ver") + pantalla limpia + tira "Última venta".
 */
export function SalePosPage({ mode, id, proformaId }: SalePosPageProps) {
  const sale = useSalePos({ mode, id, proformaId })
  const { proforma, currency, addProduct, addFreeLine, clearProforma } = useSalePosStore()

  const clientInputRef = useRef<HTMLInputElement>(null)
  const productInputRef = useRef<HTMLInputElement>(null)
  const [clientModalOpen, setClientModalOpen] = useState(false)
  const [productModalOpen, setProductModalOpen] = useState(false)
  const [proformaModalOpen, setProformaModalOpen] = useState(false)

  const focusClient = () => clientInputRef.current?.focus()
  const focusProductSearch = () => productInputRef.current?.focus()

  // Al crear, el cursor arranca en "Cliente" (primer dato que se pide en caja).
  useEffect(() => {
    if (mode === 'create' && !proformaId) focusClient()
  }, [mode, proformaId])

  // Tras emitir, la pantalla ya quedó limpia: se sube al inicio y el cursor vuelve a "Cliente".
  useEffect(() => {
    if (!sale.lastSale) return
    window.scrollTo({ top: 0, behavior: 'smooth' })
    window.setTimeout(focusClient, 50)
  }, [sale.lastSale?.id])

  const anyModalOpen = clientModalOpen || productModalOpen || proformaModalOpen

  useSalePosShortcuts({
    enabled: !anyModalOpen,
    onProduct: focusProductSearch,
    onClient: focusClient,
    onProforma: sale.isEdit ? undefined : () => setProformaModalOpen(true),
    onSubmit: () => void sale.submit(true),
  })

  const handleAddFreeLine = () => {
    const key = addFreeLine()
    // La línea libre necesita descripción: se enfoca su campo apenas aparece.
    window.setTimeout(() => {
      document
        .querySelector<HTMLInputElement>(`[data-line="${key}"][data-field="description"]`)
        ?.focus()
    }, 0)
  }

  if (sale.isLoadingSale) {
    return (
      <div className="text-muted-foreground flex flex-col items-center justify-center gap-2 py-20">
        <Loader2 className="size-6 animate-spin" />
        <p className="text-sm">Cargando venta...</p>
      </div>
    )
  }

  if (sale.loadError) {
    return <AlertError title="No se pudo cargar la venta" message={sale.loadError} />
  }

  // Solo ícono: el tooltip (y el aria-label) explican qué hace y su atajo.
  const proformaButton = !sale.isEdit && (
    <IconButton
      label="Importar proforma aceptada (F4)"
      className="shrink-0"
      disabled={sale.isImporting}
      onClick={() => setProformaModalOpen(true)}
      icon={sale.isImporting ? <Loader2 className="animate-spin" /> : <FileDown />}
    />
  )

  return (
    // pb-24 en móvil: deja espacio para la barra inferior fija con el total.
    <div className="grid grid-cols-1 gap-4 pb-24 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start lg:pb-0 xl:grid-cols-[minmax(0,1fr)_380px]">
      <div className="flex min-w-0 flex-col gap-4">
        <SaleHeaderCard
          documentTypes={sale.formData.documentTypes}
          currencies={sale.formData.currencies}
          onSelectDocumentType={sale.selectDocumentType}
          documentNumber={sale.documentNumber}
          errorFor={sale.errorFor}
          clientSlot={
            <ClientField
              inputRef={clientInputRef}
              allowGeneric={!sale.isInvoice}
              modalOpen={clientModalOpen}
              onModalOpenChange={setClientModalOpen}
              onPicked={focusProductSearch}
              error={sale.errorFor('client_id')}
              trailing={proformaButton}
            />
          }
          proformaSlot={
            proforma && (
              <ProformaChip
                code={proforma.code}
                // Al editar no se puede desvincular (el backend no acepta proforma_id en el PUT).
                onRemove={sale.isEdit ? undefined : clearProforma}
              />
            )
          }
        />

        <Card className="py-4">
          <CardContent className="flex flex-col gap-4 px-4 sm:px-6">
            <ProductSearchField
              inputRef={productInputRef}
              modalOpen={productModalOpen}
              onModalOpenChange={setProductModalOpen}
              onAdd={addProduct}
              onAddFreeLine={handleAddFreeLine}
            />

            <CartTable
              currency={currency}
              taxConfig={sale.taxConfig}
              errorFor={sale.errorFor}
              focusProductSearch={focusProductSearch}
            />

            {/* key: tras emitir, la nota vuelve a quedar plegada. */}
            <SaleNoteField key={sale.lastSale?.id ?? 0} error={sale.errorFor('observation')} />

            {/* Los atajos solo tienen sentido con teclado físico. */}
            <div className="hidden lg:block">
              <ShortcutsHint showProforma={!sale.isEdit} />
            </div>
          </CardContent>
        </Card>

        {sale.serverError && (
          <AlertError title="No se pudo guardar la venta" message={sale.serverError} />
        )}

        {/* Edición: los pagos de una venta ya existente se gestionan con su sección propia. Va a
            la izquierda para no alargar el resumen sticky. */}
        {sale.isEdit && sale.editSale && (
          <SalePaymentsSection
            saleId={sale.editSale.id}
            readOnly={false}
            amountPaid={sale.editSale.amountPaid}
            balance={sale.editSale.balance}
            currency={sale.editSale.currency}
          />
        )}
      </div>

      {/* Sticky solo en escritorio; top-20 = debajo del header fijo (h-16) + margen. */}
      <div className="lg:sticky lg:top-20">
        <SummaryPanel
          isEdit={sale.isEdit}
          documentTypeName={sale.documentType?.name ?? null}
          documentNumber={sale.documentNumber}
          totals={sale.totals}
          taxConfig={sale.taxConfig}
          paidNow={sale.paidNow}
          balance={sale.balance}
          errorFor={sale.errorFor}
          isSubmitting={sale.isSubmitting}
          onEmit={() => void sale.submit(true)}
          onSaveDraft={sale.isEdit ? () => void sale.submit(false) : undefined}
          lastSale={sale.lastSale}
        />
      </div>

      <MobileTotalBar
        total={sale.totals.total}
        currency={currency}
        isSubmitting={sale.isSubmitting}
        onEmit={() => void sale.submit(true)}
      />

      {!sale.isEdit && (
        <ProformaImportModal
          open={proformaModalOpen}
          onOpenChange={setProformaModalOpen}
          onSelect={(pid) => void sale.importProforma(pid)}
        />
      )}
    </div>
  )
}
