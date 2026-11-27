'use client'

// Pestaña "Apariencia" de Configuración de Sección: qué MUESTRA la web pública de esta sección.
// Editor GENÉRICO: se arma solo con `display_settings_schema` (el catálogo vive en el backend,
// config/section_display/*.php) — para agregar un elemento/grupo/tipo de sección no se toca nada
// acá. Los cambios se ven al instante en la vista previa y se publican al guardar (PATCH de la
// sección con SOLO las claves que cambiaron).

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { swalSuccess } from '@/shared/lib/swal'
import { AlertError } from '@/widgets/alerts_components/alert-error'
import { useSectionAppearanceStore } from '../../stores/useSectionAppearanceStore'
import { AppearanceEditorBody } from './appearance-editor-body'

export function SectionAppearanceEditor({ id }: { id: string }) {
  const router = useRouter()
  const { section, isLoading, isSubmitting, error, fieldErrors, get, update, reset } = useSectionAppearanceStore()

  useEffect(() => { void get(Number(id)) }, [id, get])
  useEffect(() => () => reset(), [reset])

  if (isLoading && !section) return <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">Cargando...</div>
  if (!section) {
    return error
      ? <AlertError title="No se pudo cargar la sección" message={error} />
      : null
  }

  return (
    <AppearanceEditorBody
      section={section}
      isSubmitting={isSubmitting}
      error={error}
      fieldErrors={fieldErrors}
      onBack={() => router.push(`/sections/${id}`)}
      onSave={async (patch) => {
        const ok = await update(section.id, patch)
        // Recarga lo guardado: el borrador se limpia solo al llegar la sección nueva
        if (ok) { await swalSuccess('Apariencia guardada', section.name); void get(section.id) }
        return ok
      }}
    />
  )
}
