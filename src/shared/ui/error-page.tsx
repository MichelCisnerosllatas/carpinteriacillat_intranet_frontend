import type { ReactNode } from 'react'
import { Hammer, Ruler, Wrench } from 'lucide-react'
import { cn } from '@/shared/lib/utils'

type ErrorPageProps = {
  /** Código del error: '404', '403', '500'... Se muestra como una etiqueta pequeña ("Error 404"). */
  code: string
  title: string
  /** Texto debajo del título. Puede llevar elementos (ej. la URL resaltada). */
  description: ReactNode
  /** Icono principal ya dibujado, ej: <SearchX className="size-10" /> */
  icon: ReactNode
  /** Contenido extra entre el texto y los botones (ej. accesos rápidos). */
  children?: ReactNode
  /** Botones de abajo (Link, Button, GoBackButton...). */
  actions?: ReactNode
  /** true = ocupa toda la pantalla (fuera del layout). false = dentro del layout del intranet. */
  fullScreen?: boolean
}

/**
 * Diseño común de las páginas de error del intranet (404, 401, 403, 500, 503, error inesperado).
 *
 *        🔨   📏          ← herramientas flotando alrededor
 *          (  icono  )
 *        🔧
 *        [ Error 404 ]
 *     Título amigable
 *     Descripción
 *     (contenido extra)
 *     [botones]
 *
 * Es un Server Component: los botones que necesitan el navegador (ej. "Volver atrás") se pasan en `actions`.
 */
export function ErrorPage({
  code,
  title,
  description,
  icon,
  children,
  actions,
  fullScreen = true,
}: ErrorPageProps) {
  return (
    <div
      className={cn(
        'relative flex flex-col items-center justify-center overflow-hidden px-6 py-12 text-center',
        fullScreen ? 'min-h-svh bg-background' : 'min-h-[75vh] flex-1'
      )}
    >
      {/* Brillo suave de fondo */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-0 left-1/2 size-[40rem] -translate-x-1/2 -translate-y-1/3 rounded-full bg-primary/10 blur-3xl"
      />

      <div className="relative flex w-full max-w-2xl flex-col items-center gap-6">
        {/* Ilustración: icono principal con herramientas alrededor */}
        <div className="relative flex size-36 items-center justify-center">
          <span className="absolute inset-0 rounded-full bg-primary/10" />
          <span className="absolute inset-4 rounded-full bg-primary/15" />
          <span className="relative flex size-20 items-center justify-center rounded-3xl bg-background text-primary shadow-lg ring-1 ring-border">
            {icon}
          </span>
          <Hammer aria-hidden className="absolute -top-1 -left-3 size-6 -rotate-12 text-primary/50" />
          <Ruler aria-hidden className="absolute top-2 -right-4 size-6 rotate-45 text-muted-foreground/60" />
          <Wrench aria-hidden className="absolute -bottom-1 -left-1 size-5 rotate-12 text-muted-foreground/60" />
        </div>

        <span className="rounded-full border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
          Error {code}
        </span>

        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
          <div className="mx-auto max-w-md text-muted-foreground">{description}</div>
        </div>

        {children}

        {actions && <div className="flex flex-wrap items-center justify-center gap-3">{actions}</div>}
      </div>
    </div>
  )
}
