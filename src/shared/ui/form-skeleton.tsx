import { Card, CardContent } from '@/shared/ui/card'
import { Skeleton } from '@/shared/ui/skeleton'

/**
 * Esqueleto de un formulario mientras carga lo que decide CÓMO se ve
 * (ej. el tipo de la sección, o los datos del registro al editar).
 *
 * Por qué existe: sin esto el formulario se pintaba primero con textos y campos
 * "generales" y, al terminar de cargar, cambiaba de golpe (otros labels, otros campos).
 * Con el esqueleto el usuario ve un "cargando" con la misma forma, y el formulario
 * aparece una sola vez, ya correcto.
 *
 * - `cards`: cuántas tarjetas simular (default 2).
 * - `fieldsPerCard`: cuántos campos (label + input) por tarjeta (default 4).
 * - `fluid`: true = mismas columnas fluidas que los formularios a todo el ancho;
 *            false = una sola columna angosta (formularios de ancho fijo).
 */
export function FormSkeleton({
  cards = 2,
  fieldsPerCard = 4,
  fluid = true,
}: {
  cards?: number
  fieldsPerCard?: number
  fluid?: boolean
}) {
  return (
    <div className="flex flex-col gap-4" aria-busy="true" aria-label="Cargando formulario">
      <div
        className={
          fluid
            ? 'grid grid-cols-[repeat(auto-fit,minmax(min(100%,340px),1fr))] gap-4'
            : 'flex max-w-3xl flex-col gap-4'
        }
      >
        {Array.from({ length: cards }).map((_, cardIndex) => (
          <Card key={cardIndex}>
            <CardContent className="flex flex-col gap-5 pt-6">
              {/* Título del grupo */}
              <div className="flex flex-col gap-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-56" />
              </div>
              {/* Campos: label + input */}
              {Array.from({ length: fieldsPerCard }).map((_, fieldIndex) => (
                <div key={fieldIndex} className="flex flex-col gap-2">
                  <Skeleton className="h-3.5 w-28" />
                  <Skeleton className="h-9 w-full" />
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
      {/* Botones Cancelar / Guardar */}
      <div className="flex justify-end gap-2 border-t pt-4">
        <Skeleton className="h-9 w-24" />
        <Skeleton className="h-9 w-24" />
      </div>
    </div>
  )
}
