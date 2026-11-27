'use client'

import { IdCard, Mail, Pencil, UserRound } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Separator } from '@/shared/ui/separator'
import type { ProfileDto } from '../../model/profile.dto'
import { ProfilePersonalForm } from '../profile-personal-form'
import { Row } from './row'

// ─── Pestaña: Datos personales ────────────────────────────────────────────────

type PersonalTabProps = {
  profile: ProfileDto
  isEditing: boolean
  onEditingChange: (value: boolean) => void
}

export function PersonalTab({ profile, isEditing, onEditingChange }: PersonalTabProps) {
  const person = profile.person
  const document = person?.person_numdoc ? `${person.typedoc_name ?? ''} ${person.person_numdoc}`.trim() : null

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-2">
        <div className="grid gap-1.5">
          <CardTitle className="flex items-center gap-2 text-base">
            <UserRound className="size-4" />
            Datos personales
          </CardTitle>
          <CardDescription>
            {isEditing ? 'Modifica tus datos y presiona "Guardar cambios".' : 'Tu nombre, documento y correo personal.'}
          </CardDescription>
        </div>
        {/* Botón "Editar": solo en modo lectura y si el usuario tiene datos personales. */}
        {!isEditing && person && (
          <Button variant="outline" size="sm" onClick={() => onEditingChange(true)}>
            <Pencil className="size-4" />
            Editar
          </Button>
        )}
      </CardHeader>

      <CardContent>
        {isEditing ? (
          <ProfilePersonalForm
            profile={profile}
            onCancel={() => onEditingChange(false)}
            onSaved={() => onEditingChange(false)}
          />
        ) : (
          <div className="flex flex-col gap-3 text-sm">
            <Row label="Nombres" value={person?.person_name} />
            <Separator />
            <Row label="Apellidos" value={person?.person_lastname} />
            <Separator />
            <Row label="Documento" icon={<IdCard className="size-3.5" />} value={document} />
            <Separator />
            <Row label="Correo personal" icon={<Mail className="size-3.5" />} value={person?.person_email} />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
