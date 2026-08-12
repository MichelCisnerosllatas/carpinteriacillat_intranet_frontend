type ShimmerProps = {
  className?: string
}

function Shimmer({ className = '' }: ShimmerProps) {
  return (
    <div
      className={`
        relative overflow-hidden rounded-md bg-muted/60
        after:absolute after:inset-0
        after:-translate-x-full
        after:animate-[shimmer_1.7s_ease-in-out_infinite]
        after:bg-gradient-to-r
        after:from-transparent
        after:via-foreground/10
        after:to-transparent
        ${className}
      `}
    />
  )
}

function SkeletonHeader({ width = 'w-32' }: { width?: string }) {
  return (
    <div className="flex min-h-[78px] items-center gap-2 border-b px-6">
      <Shimmer className={`h-5 ${width}`} />
    </div>
  )
}

export function SaleSettingsSkeleton() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Cargando configuración de ventas"
      className="mx-auto flex w-full max-w-3xl flex-col gap-5"
    >
      <section className="overflow-hidden rounded-xl border bg-card">
        <SkeletonHeader width="w-40" />

        <div className="grid gap-x-5 gap-y-4 p-6 md:grid-cols-2">
          <div className="space-y-2">
            <Shimmer className="h-4 w-28" />
            <Shimmer className="h-9 w-full rounded-lg" />
          </div>

          <div className="space-y-2">
            <Shimmer className="h-4 w-20" />
            <Shimmer className="h-9 w-full rounded-lg" />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3 md:col-span-2">
            <div className="space-y-2">
              <Shimmer className="h-4 w-48" />
              <Shimmer className="h-3 w-64" />
            </div>
            <Shimmer className="h-5 w-9 rounded-full" />
          </div>
        </div>
      </section>

      <div className="flex min-h-[62px] items-center justify-end rounded-xl border bg-card px-4">
        <Shimmer className="h-9 w-40 rounded-lg" />
      </div>

      <span className="sr-only">Cargando configuración...</span>
    </div>
  )
}
