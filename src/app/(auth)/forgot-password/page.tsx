import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, KeyRound } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/ui/card'
import { ForgotPasswordForm } from '@/features/auth/ui/forgot-password-form'

export const metadata: Metadata = { title: 'Recuperar contraseña' }

export default function ForgotPasswordPage() {
  return (
    <main className="relative flex min-h-svh items-center justify-center overflow-hidden bg-background px-5 py-10">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,oklch(0.208_0.042_265.755_/_0.18),transparent_35%),radial-gradient(circle_at_bottom_right,oklch(0.208_0.042_265.755_/_0.12),transparent_30%)]" />

      <div className="w-full max-w-[440px] space-y-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex size-16 items-center justify-center rounded-3xl border bg-card shadow-sm">
            <Image src="/cillat/logo.png" alt="Cillat" width={44} height={44} className="object-contain" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Intranet corporativa</p>
            <h1 className="text-2xl font-bold tracking-tight">Carpintería Cillat</h1>
          </div>
        </div>

        <Card className="border-border/70 shadow-xl shadow-black/5">
          <CardHeader className="space-y-3 pb-4">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <KeyRound className="size-5" />
            </div>
            <div className="space-y-1">
              <CardTitle className="text-2xl tracking-tight">¿Olvidaste tu contraseña?</CardTitle>
              <CardDescription>
                Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <ForgotPasswordForm />

            <Link
              href="/sign-in"
              className="mt-6 flex items-center justify-center gap-2 text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              <ArrowLeft className="size-4" />
              Volver a iniciar sesión
            </Link>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Carpintería Cillat. Acceso exclusivo para personal autorizado.
        </p>
      </div>
    </main>
  )
}
