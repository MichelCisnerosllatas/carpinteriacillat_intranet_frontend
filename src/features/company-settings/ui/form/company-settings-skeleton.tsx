type ShimmerProps = {
  className?: string;
};

function Shimmer({ className = "" }: ShimmerProps) {
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
  );
}

function SkeletonHeader({ width = "w-32" }: { width?: string }) {
  return (
    <div className="flex min-h-[78px] items-center gap-2 border-b px-6">
      <Shimmer className={`h-5 ${width}`} />
      <Shimmer className="size-4 rounded-full" />
    </div>
  );
}

function ContactOptionSkeleton() {
  return (
    <div className="flex min-h-24 items-center gap-4 rounded-xl border bg-background/20 p-4">
      <Shimmer className="size-11 shrink-0 rounded-xl" />

      <div className="min-w-0 flex-1 space-y-2">
        <Shimmer className="h-4 w-44 max-w-full" />
        <Shimmer className="h-3 w-56 max-w-[85%]" />
      </div>

      <Shimmer className="h-4 w-4 shrink-0 rounded-full" />
    </div>
  );
}

export function CompanySettingsSkeleton() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Cargando configuración de la empresa"
      className="flex flex-col gap-5"
    >
      {/* Logo y datos fiscales */}
      <div className="grid items-stretch gap-5 lg:grid-cols-[305px_minmax(0,1fr)]">
        {/* Logo */}
        <section className="overflow-hidden rounded-xl border bg-card">
          <SkeletonHeader width="w-16" />

          <div className="flex min-h-[335px] items-center justify-center p-6">
            <Shimmer className="aspect-square w-full max-w-[240px] rounded-xl" />
          </div>
        </section>

        {/* Datos fiscales */}
        <section className="overflow-hidden rounded-xl border bg-card">
          <SkeletonHeader width="w-28" />

          <div className="grid gap-x-5 gap-y-4 p-6 md:grid-cols-12">
            {/* Razón social */}
            <div className="space-y-2 md:col-span-8">
              <Shimmer className="h-4 w-24" />
              <Shimmer className="h-9 w-full rounded-lg" />
            </div>

            {/* Nombre comercial */}
            <div className="space-y-2 md:col-span-4">
              <Shimmer className="h-4 w-32" />
              <Shimmer className="h-9 w-full rounded-lg" />
            </div>

            {/* RUC */}
            <div className="space-y-2 md:col-span-4">
              <Shimmer className="h-4 w-12" />
              <Shimmer className="h-9 w-full rounded-lg" />
            </div>

            {/* Estado */}
            <div className="space-y-2 md:col-span-4">
              <Shimmer className="h-4 w-14" />
              <Shimmer className="h-9 w-full rounded-lg" />
            </div>

            {/* Espacio equivalente al diseño final */}
            <div className="hidden md:col-span-4 md:block" />

            {/* Dirección fiscal */}
            <div className="space-y-2 md:col-span-12">
              <Shimmer className="h-4 w-28" />
              <Shimmer className="h-24 w-full rounded-lg" />
            </div>
          </div>
        </section>
      </div>

      {/* Contactos */}
      <section className="overflow-hidden rounded-xl border bg-card">
        <SkeletonHeader width="w-56" />

        <div className="grid gap-4 p-6 md:grid-cols-2">
          <ContactOptionSkeleton />
          <ContactOptionSkeleton />
        </div>
      </section>

      {/* Barra de acciones */}
      <div className="flex min-h-[62px] items-center justify-end rounded-xl border bg-card px-4">
        <Shimmer className="h-9 w-40 rounded-lg" />
      </div>

      <span className="sr-only">Cargando configuración...</span>
    </div>
  );
}