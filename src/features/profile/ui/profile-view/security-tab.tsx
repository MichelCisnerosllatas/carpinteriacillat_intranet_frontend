'use client'

import { useState } from 'react'
import Link from 'next/link'
import { KeyRound, LogIn, Mail, MonitorSmartphone, Pencil } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Separator } from '@/shared/ui/separator'
import type { ProfileDto } from '../../model/profile.dto'
import { ChangePasswordForm } from '../change-password-form'
import { ChangeLoginEmailForm } from '../change-login-email-form'
import { Row } from './row'

// ─── Pestaña: Seguridad ───────────────────────────────────────────────────────

export function SecurityTab({ profile }: { profile: ProfileDto }) {
  // ¿Está abierto el formulario para cambiar el correo de acceso?
  const [isChangingEmail, setIsChangingEmail] = useState(false)
  const isGoogleAccount = profile.registration_provider === 'google'

  return (
    <div className="flex flex-col gap-4">
      {/* Correo de acceso */}
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-2">
          <div className="grid gap-1.5">
            <CardTitle className="flex items-center gap-2 text-base">
              <LogIn className="size-4" />
              Correo de acceso
            </CardTitle>
            <CardDescription>Es el correo con el que inicias sesión.</CardDescription>
          </div>
          {!isChangingEmail && !isGoogleAccount && (
            <Button variant="outline" size="sm" onClick={() => setIsChangingEmail(true)}>
              <Pencil className="size-4" />
              Cambiar
            </Button>
          )}
        </CardHeader>
        <CardContent className="flex flex-col gap-3 text-sm">
          <Row label="Correo actual" icon={<Mail className="size-3.5" />} value={profile.email} />
          <Separator />
          <Row label="Inicio de sesión" value={isGoogleAccount ? 'Google' : 'Correo y contraseña'} />

          {isGoogleAccount && (
            <p className="text-muted-foreground">
              Tu cuenta inicia sesión con Google, así que su correo no se puede cambiar desde aquí.
            </p>
          )}

          {isChangingEmail && (
            <>
              <Separator />
              <ChangeLoginEmailForm
                currentEmail={profile.email}
                onCancel={() => setIsChangingEmail(false)}
                onDone={() => setIsChangingEmail(false)}
              />
            </>
          )}
        </CardContent>
      </Card>

      {/* Contraseña */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <KeyRound className="size-4" />
            Cambiar contraseña
          </CardTitle>
        </CardHeader>
        <CardContent>
          {profile.can_change_password ? (
            <ChangePasswordForm />
          ) : (
            <p className="text-sm text-muted-foreground">
              Tu cuenta inicia sesión con Google, así que no tiene una contraseña propia. Si quieres crear una, usa
              “¿Olvidaste tu contraseña?” en la pantalla de inicio de sesión.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Dispositivos */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <div className="grid gap-1.5">
            <CardTitle className="flex items-center gap-2 text-base">
              <MonitorSmartphone className="size-4" />
              Mis dispositivos
            </CardTitle>
            <CardDescription>Revisa dónde tienes la sesión abierta y ciérrala si no la reconoces.</CardDescription>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/profile/devices">Ver</Link>
          </Button>
        </CardHeader>
      </Card>
    </div>
  )
}
