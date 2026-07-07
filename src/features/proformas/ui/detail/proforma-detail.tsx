'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil, Download, Eye, Loader2 } from 'lucide-react'
import NProgress from 'nprogress'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Separator } from '@/shared/ui/separator'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'
import { cn } from '@/shared/lib/utils'
import { swalConfirmAction } from '@/shared/lib/swal'
import { toastError, toastSuccess } from '@/shared/lib/toast'
import { useProformaListStore } from '../../stores/useProformaListStore'
import { useProformaDeleteStore } from '../../stores/useProformaDeleteStore'
import { proformasService } from '../../services/proformas.service'
import { getProformaStatusOption, getValidStatusTransitions } from '../../data/data'
import type { ProformaStatus } from '../../data/schema'

const formatCurrency = (value: number, currency: string) => `${currency} ${value.toFixed(2)}`

export function ProformaDetail({ id }: { id: string }) {
  const router = useRouter()
  const { currentItem, items, setCurrentItem, loadOne } = useProformaListStore()
  const { changeStatus } = useProformaDeleteStore()
  const [isDownloading, setIsDownloading] = useState(false)
  const [isViewing, setIsViewing] = useState(false)

  useEffect(() => {
    if (!currentItem || String(currentItem.id) !== id) {
      const found = items.find((i) => String(i.id) === id)
      if (found) setCurrentItem(found)
      else void loadOne(Number(id))
    }
  }, [id, currentItem, items])

  const item = currentItem && String(currentItem.id) === id ? currentItem : null
  if (!item)
    return (
      <div className="text-muted-foreground flex h-40 items-center justify-center text-sm">
        Cargando...
      </div>
    )

  const statusOpt = getProformaStatusOption(item.status)
  const transitions = getValidStatusTransitions(item.status)

  const handleDownload = async (download: boolean) => {
    const setLoading = download ? setIsDownloading : setIsViewing
    setLoading(true)
    try {
      const blob = download
        ? await proformasService.downloadPdf(item.id)
        : await proformasService.viewPdf(item.id)
      const url = URL.createObjectURL(blob)
      if (download) {
        const a = document.createElement('a')
        a.href = url
        a.download = `${item.code}.pdf`
        document.body.appendChild(a)
        a.click()
        a.remove()
      } else {
        window.open(url, '_blank')
      }
      setTimeout(() => URL.revokeObjectURL(url), 60_000)
    } catch {
      toastError('Error', 'No se pudo obtener el PDF.')
    } finally {
      setLoading(false)
    }
  }

  const handleChangeStatus = async (newStatus: ProformaStatus) => {
    const opt = getProformaStatusOption(newStatus)
    await swalConfirmAction({
      title: `¿Cambiar estado a "${opt.label}"?`,
      text: item.code,
      confirmText: 'Sí, continuar',
      cancelText: 'Cancelar',
      loading: { title: 'Actualizando estado...' },
      action: async ({ close, showError }) => {
        const ok = await changeStatus(item.id, newStatus)
        if (ok) {
          toastSuccess(
            'Estado actualizado',
            `"${item.code}" ahora está ${opt.label.toLowerCase()}.`
          )
          await loadOne(item.id)
          close()
        } else {
          showError('No se pudo cambiar el estado.')
        }
      },
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardContent className="flex flex-col gap-4 pt-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex flex-col gap-1">
              <h3 className="text-2xl font-bold tracking-tight">{item.code}</h3>
              <p className="text-muted-foreground text-sm">Emitida el {item.issueDate}</p>
              {item.dueDate && (
                <p className="text-muted-foreground text-sm">Vence el {item.dueDate}</p>
              )}
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge variant="outline" className={cn('text-sm', statusOpt.badge)}>
                {statusOpt.label}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  NProgress.start()
                  router.push(`/proformas/edit/${item.id}`)
                }}
              >
                <Pencil className="mr-1 size-4" />
                Editar
              </Button>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                Cliente
              </span>
              <span className="text-sm font-medium">
                {item.clientName ?? item.clientBusinessName ?? '—'}
              </span>
              {item.clientDocument && (
                <span className="text-muted-foreground text-xs">Doc: {item.clientDocument}</span>
              )}
              {item.clientAddress && (
                <span className="text-muted-foreground text-xs">{item.clientAddress}</span>
              )}
              {item.clientAttention && (
                <span className="text-muted-foreground text-xs">
                  Atención: {item.clientAttention}
                </span>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                Datos de la proforma
              </span>
              <span className="text-muted-foreground text-xs">
                Lugar de emisión: {item.placeOfIssue ?? '—'}
              </span>
              <span className="text-muted-foreground text-xs">
                Plazo de entrega: {item.deliveryTime ?? '—'}
              </span>
              <span className="text-muted-foreground text-xs">Moneda: {item.currency}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Líneas de detalle</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Descripción</TableHead>
                  <TableHead className="w-[90px]">Unidad</TableHead>
                  <TableHead className="w-[90px]">Cantidad</TableHead>
                  <TableHead className="w-[120px]">P. Unitario</TableHead>
                  <TableHead className="w-[120px] text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {item.details.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-muted-foreground h-20 text-center text-sm"
                    >
                      Sin líneas.
                    </TableCell>
                  </TableRow>
                ) : (
                  item.details.map((d) => (
                    <TableRow key={d.id}>
                      <TableCell>{d.description}</TableCell>
                      <TableCell>{d.unit ?? '—'}</TableCell>
                      <TableCell>{d.quantity}</TableCell>
                      <TableCell>{formatCurrency(d.unitPrice, item.currency)}</TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(d.total, item.currency)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="mt-4 ml-auto flex w-full max-w-xs flex-col gap-1 rounded-lg border p-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">{formatCurrency(item.subtotal, item.currency)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Impuestos</span>
              <span className="font-medium">{formatCurrency(item.tax, item.currency)}</span>
            </div>
            <div className="mt-1 flex justify-between border-t pt-1 text-lg">
              <span className="font-semibold">Total</span>
              <span className="font-bold">{formatCurrency(item.total, item.currency)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Acciones</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={isDownloading}
            onClick={() => void handleDownload(true)}
          >
            {isDownloading ? (
              <Loader2 className="mr-1 size-4 animate-spin" />
            ) : (
              <Download className="mr-1 size-4" />
            )}
            Descargar PDF
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={isViewing}
            onClick={() => void handleDownload(false)}
          >
            {isViewing ? (
              <Loader2 className="mr-1 size-4 animate-spin" />
            ) : (
              <Eye className="mr-1 size-4" />
            )}
            Ver PDF
          </Button>

          {transitions.length > 0 && (
            <>
              <Separator orientation="vertical" className="h-6" />
              <span className="text-muted-foreground text-xs">Cambiar estado a:</span>
              {transitions.map((t) => (
                <Button
                  key={t.value}
                  variant="outline"
                  size="sm"
                  onClick={() => void handleChangeStatus(t.value)}
                >
                  {t.label}
                </Button>
              ))}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
