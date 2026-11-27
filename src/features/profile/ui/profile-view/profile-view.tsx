'use client'

import { useEffect, useState } from 'react'
import { Building2, KeyRound, ShieldCheck, UserRound } from 'lucide-react'
import { Badge } from '@/shared/ui/badge'
import { Card, CardContent } from '@/shared/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs'
import { ErrorState } from '@/widgets/error/error-state'
import { CircleProgressIndicatorPage } from '@/widgets/CircleProgressIndicatorPage'
import { getImageUrl } from '@/features/images/lib/image-url'
import { useProfileStore } from '../../stores/useProfileStore'
import { ProfilePhotoField } from '../profile-photo-field'
import { PersonalTab } from './personal-tab'
import { SecurityTab } from './security-tab'
import { OrganizationTab } from './organization-tab'

/**
 * "Mi perfil" del usuario autenticado.
 * - Cabecera: foto, nombre, correo, rol y empresa.
 * - Pestaña "Datos personales": se ven en modo lectura; con "Editar" se vuelven formulario
 *   (y la foto se puede cambiar).
 * - Pestaña "Seguridad": correo de acceso, contraseña y dispositivos.
 * - Pestaña "Organización": rol, empresa y sucursales (solo lectura).
 */
export function ProfileView() {
  const { profile, isLoading, isError, message, load } = useProfileStore()

  // ¿Está editando sus datos personales? (también habilita cambiar la foto)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    void load()
  }, [load])

  if (!profile && isLoading) return <CircleProgressIndicatorPage />

  if (!profile || isError) {
    return (
      <ErrorState
        isPrimaryLoading={isLoading}
        title="No se pudo cargar tu perfil"
        message={message ?? undefined}
        primaryLabel="Reintentar"
        onPrimaryAction={() => void load()}
      />
    )
  }

  const fullName =
    `${profile.person?.person_name ?? ''} ${profile.person?.person_lastname ?? ''}`.trim() || profile.email
  const photo = profile.person?.photo_url ? getImageUrl(profile.person.photo_url) : ''
  const companyName = profile.company?.trade_name || profile.company?.business_name || null

  return (
    <div className="flex flex-col gap-4">
      {/* ── Cabecera ─────────────────────────────────────────────── */}
      <Card>
        <CardContent className="flex flex-col items-center gap-4 pt-6 text-center sm:flex-row sm:text-start">
          <ProfilePhotoField photo={photo} fullName={fullName} editable={isEditing} />
          <div className="grid min-w-0 flex-1 gap-1">
            <h3 className="truncate text-xl font-semibold">{fullName}</h3>
            <p className="truncate text-sm text-muted-foreground">{profile.email}</p>
            <div className="mt-1 flex flex-wrap justify-center gap-2 sm:justify-start">
              <Badge variant="secondary" className="gap-1">
                <ShieldCheck className="size-3.5" />
                {profile.role?.role_name ?? 'Sin rol'}
              </Badge>
              {profile.is_superadmin && <Badge>Superadmin</Badge>}
              {companyName && (
                <Badge variant="outline" className="gap-1">
                  <Building2 className="size-3.5" />
                  {companyName}
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Pestañas ─────────────────────────────────────────────── */}
      <Tabs defaultValue="personal" className="gap-4">
        <TabsList className="w-full sm:w-fit">
          <TabsTrigger value="personal">
            <UserRound className="size-4" />
            Datos personales
          </TabsTrigger>
          <TabsTrigger value="security">
            <KeyRound className="size-4" />
            Seguridad
          </TabsTrigger>
          <TabsTrigger value="organization">
            <Building2 className="size-4" />
            Organización
          </TabsTrigger>
        </TabsList>

        <TabsContent value="personal">
          <PersonalTab profile={profile} isEditing={isEditing} onEditingChange={setIsEditing} />
        </TabsContent>

        <TabsContent value="security">
          <SecurityTab profile={profile} />
        </TabsContent>

        <TabsContent value="organization">
          <OrganizationTab profile={profile} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
