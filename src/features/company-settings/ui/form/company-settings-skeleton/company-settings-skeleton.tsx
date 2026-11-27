import { SkeletonHeader } from './skeleton-header'
import { Shimmer } from './shimmer'
import { ContactOptionSkeleton } from './contact-option-skeleton'

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
