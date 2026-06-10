
import type { Metadata } from 'next'
import Image from 'next/image'
import { Building2, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { SignInForm } from '@/features/auth/ui/sign-in-form'

export const metadata: Metadata = { title: 'Iniciar sesión' }

const benefits = [
  'Acceso seguro a la intranet corporativa',
  'Gestión centralizada de operaciones',
  'Panel administrativo moderno y organizado',
]


export default function SignInPage() {
  return (
    <main className="relative min-h-svh overflow-hidden bg-background">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,oklch(0.208_0.042_265.755_/_0.18),transparent_35%),radial-gradient(circle_at_bottom_right,oklch(0.208_0.042_265.755_/_0.12),transparent_30%)]" />

      <section className="grid min-h-svh lg:grid-cols-[1.05fr_0.95fr]">
        <aside className="relative hidden overflow-hidden bg-[oklch(0.208_0.042_265.755)] p-10 text-white lg:flex lg:flex-col lg:justify-between xl:p-14">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.18),transparent_35%),radial-gradient(circle_at_70%_20%,rgba(255,255,255,0.22),transparent_28%)]" />

          <div className="relative z-10 flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-white/15 shadow-lg backdrop-blur">
              <Image src="/cillat/logo.png" alt="Cillat" width={34} height={34} className="object-contain" />
            </div>
            <div>
              <p className="text-sm font-medium text-white/75">Intranet</p>
              <h1 className="text-2xl font-bold tracking-tight">Carpintería Cillat</h1>
            </div>
          </div>

          <div className="relative z-10 max-w-xl space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-white/90 backdrop-blur">
              <Sparkles className="size-4" />
              Plataforma administrativa
            </div>

            <div className="space-y-4">
              <h2 className="text-4xl font-bold leading-tight tracking-tight xl:text-5xl">
                Gestiona tu operación desde un solo lugar.
              </h2>
              <p className="max-w-lg text-base leading-7 text-white/78">
                Ingresa con tus credenciales para acceder al panel interno, revisar información clave y administrar los módulos disponibles.
              </p>
            </div>

            <div className="grid gap-3">
              {benefits.map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                  <CheckCircle2 className="size-5 shrink-0 text-white" />
                  <span className="text-sm text-white/85">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>

        <div className="flex items-center justify-center px-5 py-10 sm:px-8 lg:px-12">
          <div className="w-full max-w-[440px] space-y-6">
            <div className="flex flex-col items-center gap-3 text-center lg:hidden">
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
                  <Building2 className="size-5" />
                </div>
                <div className="space-y-1">
                  <CardTitle className="text-2xl tracking-tight">Iniciar sesión</CardTitle>
                  <CardDescription>
                    Ingresa tu usuario y contraseña para continuar al panel administrativo.
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <SignInForm />
              </CardContent>
            </Card>

            <p className="text-center text-xs text-muted-foreground">
              © {new Date().getFullYear()} Carpintería Cillat. Acceso exclusivo para personal autorizado.
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}