'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { UserPen, Mail, IdCard, ShieldCheck, CalendarDays, RefreshCw } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Separator } from '@/shared/ui/separator'
import { callTypes, roles } from '@/features/users/data/data'
import { useUserListStore } from '@/features/users/stores/useUserListStore'
import NProgress from 'nprogress'

interface UserDetailProps {
  id: string
}

export function UserDetail({ id }: UserDetailProps) {
  const router = useRouter()
  const { currentUser, users, setCurrentUser } = useUserListStore()

  useEffect(() => {
    if (!currentUser || String(currentUser.id) !== id) {
      const found = users.find((u) => String(u.id) === id)
      if (found) {
        setCurrentUser(found)
      } else {
        router.replace('/users')
      }
    }
  }, [id, currentUser, users, setCurrentUser, router])

  const user = currentUser && String(currentUser.id) === id ? currentUser : null

  if (!user) {
    return (
      <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">
        Cargando detalle del usuario...
      </div>
    )
  }

  const roleIcon = roles.find((r) => r.value === user.role)
  const RoleIcon = roleIcon?.icon ?? ShieldCheck
  const statusClass = callTypes.get(user.status) ?? ''

  const handleEdit = () => {
    NProgress.start()
    router.push(`/users/edit/${user.id}`)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Cabecera con avatar y acciones */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted text-2xl font-semibold uppercase shrink-0">
              {user.firstName.charAt(0)}{user.lastName.charAt(0)}
            </div>
            <div className="flex flex-1 flex-col gap-1">
              <h3 className="text-xl font-semibold">{user.firstName} {user.lastName}</h3>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <div className="flex flex-wrap gap-2 mt-1">
                <Badge variant="outline" className={statusClass}>
                  {user.statusLabel}
                </Badge>
                <Badge variant="secondary" className="flex items-center gap-1">
                  <RoleIcon className="size-3" />
                  {user.roleLabel}
                </Badge>
              </div>
            </div>
            <Button onClick={handleEdit} variant="outline" size="sm" className="shrink-0">
              <UserPen className="size-4 mr-2" />
              Editar
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 sm:grid-cols-2">
        {/* Información personal */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <IdCard className="size-4" />
              Información Personal
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm">
            <DetailRow label="Nombre" value={user.firstName} />
            <Separator />
            <DetailRow label="Apellido" value={user.lastName} />
            <Separator />
            <DetailRow label="Tipo de documento" value={user.typeDocName} />
            <Separator />
            <DetailRow label="N° de documento" value={user.documentNumber} />
          </CardContent>
        </Card>

        {/* Cuenta */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Mail className="size-4" />
              Cuenta
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm">
            <DetailRow label="Correo electrónico" value={user.email} />
            <Separator />
            <DetailRow label="Rol" value={user.roleLabel} />
            <Separator />
            <DetailRow label="Estado" value={user.statusLabel} />
          </CardContent>
        </Card>

        {/* Fechas */}
        <Card className="sm:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CalendarDays className="size-4" />
              Registro
            </CardTitle>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-2 gap-3 text-sm">
            <div className="flex flex-col gap-3">
              <DetailRow label="Creado el" value={user.createdAt} />
            </div>
            <div className="flex flex-col gap-3">
              <DetailRow
                label={<span className="flex items-center gap-1"><RefreshCw className="size-3" /> Última actualización</span>}
                value={user.updatedAt}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function DetailRow({
  label,
  value,
}: {
  label: React.ReactNode
  value: string
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className="font-medium text-right">{value}</span>
    </div>
  )
}
