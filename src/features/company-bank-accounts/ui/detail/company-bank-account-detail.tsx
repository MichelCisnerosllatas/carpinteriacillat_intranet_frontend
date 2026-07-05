'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CalendarDays, Pencil, SortAsc } from 'lucide-react'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Separator } from '@/shared/ui/separator'
import { cn } from '@/shared/lib/utils'
import { getStateOption } from '@/shared/config/entity-states'
import { useCompanyBankAccountListStore } from '../../stores/useCompanyBankAccountListStore'
import { BankLogo } from '../list/bank-logo'
import NProgress from 'nprogress'

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-0.5">
      <span className="shrink-0 text-sm text-muted-foreground">{label}</span>
      <span className="text-right text-sm font-medium">{value ?? '—'}</span>
    </div>
  )
}

export function CompanyBankAccountDetail({ id }: { id: string }) {
  const router = useRouter()
  const { currentItem, items, setCurrentItem } = useCompanyBankAccountListStore()

  useEffect(() => {
    if (!currentItem || String(currentItem.id) !== id) {
      const found = items.find((i) => String(i.id) === id)
      if (found) setCurrentItem(found)
      else router.replace('/company-bank-accounts')
    }
  }, [id, currentItem, items])

  const item = currentItem && String(currentItem.id) === id ? currentItem : null
  if (!item) {
    return <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">Cargando...</div>
  }

  const stateOpt = getStateOption(item.status)

  return (
    <div className="flex max-w-lg flex-col gap-4">

      {/* ── Cuenta hero card ── */}
      <Card className="overflow-hidden">
        <CardContent className="pt-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <BankLogo logo={item.logo} className="size-14" />
              <div className="flex flex-col gap-1.5">
                <h3 className="text-lg font-semibold leading-tight">{item.bank}</h3>
                <span className="font-mono text-xs text-muted-foreground">{item.accountNumber}</span>
                {item.accountType && (
                  <span className="text-xs text-muted-foreground">{item.accountType}</span>
                )}
                <Badge variant="outline" className={cn('w-fit text-xs', stateOpt.badge)}>
                  {stateOpt.label}
                </Badge>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="shrink-0"
              onClick={() => { NProgress.start(); router.push(`/company-bank-accounts/edit/${item.id}`) }}
            >
              <Pencil className="mr-1 size-4" />Editar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ── Detalles ── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">Detalles</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-1">
          <DetailRow label="Moneda" value={<span className="font-mono">{item.currency}</span>} />
          <Separator />
          <DetailRow
            label="Orden en catálogo"
            value={
              <div className="flex items-center gap-1.5">
                <SortAsc className="size-3.5 text-muted-foreground" />
                {item.order}
              </div>
            }
          />
        </CardContent>
      </Card>

      {/* ── Registro ── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <CalendarDays className="size-4" />Registro
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-1">
          <DetailRow label="Creado el" value={item.createdAt} />
          <Separator />
          <DetailRow label="Actualizado" value={item.updatedAt || null} />
        </CardContent>
      </Card>
    </div>
  )
}
