'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil, ShieldCheck, CalendarDays, RefreshCw, KeyRound, Lock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Separator } from '@/shared/ui/separator'
import { cn } from '@/shared/lib/utils'
import { roleStatusBadge } from '@/features/roles/data/data'
import { useRoleListStore } from '@/features/roles/stores/useRoleListStore'
import NProgress from 'nprogress'
import { useCan } from '@/features/auth/hooks/usePermission'

interface RoleDetailProps {
  id: string
}

export function RoleDetail({ id }: RoleDetailProps) {
  const router = useRouter()
  const { currentRole, roles, setCurrentRole } = useRoleListStore()
  const canUpdate = useCan('roles.update')
  const canView = useCan('roles.view')

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

  const handlePermissions = () => {
    NProgress.start()
    router.push(`/roles/${role.id}/permissions`)
  }

  // Los roles del sistema (superadmin) no se editan
  const showEdit = canUpdate && !role.isSystem

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
              <div className="mt-1 flex flex-wrap gap-2">
                <Badge variant="outline" className={cn('capitalize', statusClass)}>
                  {role.statusLabel}
                </Badge>
                {role.isSystem && (
                  <Badge variant="secondary" className="gap-1">
                    <Lock className="size-3" /> Sistema
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex shrink-0 flex-wrap gap-2">
              {/* El superadmin no tiene botón: tiene acceso total y no se edita */}
              {canView && !role.isSystem && (
                <Button onClick={handlePermissions} variant="outline" size="sm">
                  <KeyRound className="size-4 mr-2" />
                  Permisos
                </Button>
              )}
              {showEdit && (
                <Button onClick={handleEdit} variant="outline" size="sm">
                  <Pencil className="size-4 mr-2" />
                  Editar
                </Button>
              )}
            </div>
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
