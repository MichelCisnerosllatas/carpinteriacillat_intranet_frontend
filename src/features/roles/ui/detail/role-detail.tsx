'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil, ShieldCheck, CalendarDays, RefreshCw } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Separator } from '@/shared/ui/separator'
import { cn } from '@/shared/lib/utils'
import { roleStatusBadge } from '@/features/roles/data/data'
import { useRoleListStore } from '@/features/roles/stores/useRoleListStore'
import NProgress from 'nprogress'

interface RoleDetailProps {
  id: string
}

export function RoleDetail({ id }: RoleDetailProps) {
  const router = useRouter()
  const { currentRole, roles, setCurrentRole } = useRoleListStore()

  useEffect(() => {
    if (!currentRole || String(currentRole.id) !== id) {
      const found = roles.find((r) => String(r.id) === id)
      if (found) {
        setCurrentRole(found)
      } else {
        router.replace('/roles')
      }
    }
  }, [id, currentRole, roles, setCurrentRole, router])

  const role = currentRole && String(currentRole.id) === id ? currentRole : null

  if (!role) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
        Cargando detalle del rol...
      </div>
    )
  }

  const statusClass = roleStatusBadge.get(role.status) ?? ''

  const handleEdit = () => {
    NProgress.start()
    router.push(`/roles/edit/${role.id}`)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Cabecera */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex size-16 items-center justify-center rounded-full bg-muted text-muted-foreground shrink-0">
              <ShieldCheck className="size-8" />
            </div>
            <div className="flex flex-1 flex-col gap-1">
              <h3 className="text-xl font-semibold">{role.name}</h3>
              {role.description && (
                <p className="text-sm text-muted-foreground">{role.description}</p>
              )}
              <div className="mt-1">
                <Badge variant="outline" className={cn('capitalize', statusClass)}>
                  {role.statusLabel}
                </Badge>
              </div>
            </div>
            <Button onClick={handleEdit} variant="outline" size="sm" className="shrink-0">
              <Pencil className="size-4 mr-2" />
              Editar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Fechas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <CalendarDays className="size-4" />
            Registro
          </CardTitle>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-2 gap-3 text-sm">
          <div className="flex flex-col gap-3">
            <DetailRow label="Creado el" value={role.createdAt} />
          </div>
          <div className="flex flex-col gap-3">
            <DetailRow
              label={<span className="flex items-center gap-1"><RefreshCw className="size-3" /> Última actualización</span>}
              value={role.updatedAt || '—'}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function DetailRow({ label, value }: { label: React.ReactNode; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className="font-medium text-right">{value}</span>
    </div>
  )
}
