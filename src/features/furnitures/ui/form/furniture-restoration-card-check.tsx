'use client'

// Atajo del formulario de Mueble: "Mostrar en «Restauración» (página Servicios)".
// Al guardar, el backend crea/reactiva (true) u oculta (false) la tarjeta de este mueble en la
// sección «Restauración» (campo show_on_restoration). La tarjeta compara sus fotos Antes/Después.
// Al crearla, el nombre del trabajo empieza siendo el del mueble; después es libre (se edita en la
// sección) y NO cambia al renombrar el mueble.
// Ver features/sectionimages/grouped/README.md → "Restauración".

import { FurnitureShortcutCheck } from './furniture-shortcut-check'

interface FurnitureRestorationCardCheckProps {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  /** Sección «Restauración» (viene en `restoration_card.id_section`). Sin ella no se muestra el enlace. */
  idSection?: number | null
  /** ¿Tiene al menos una foto "Antes" y una "Después" visibles en su galería? (`restoration_card.has_before_after`). */
  hasBeforeAfter: boolean
  disabled?: boolean
}

/** Checkbox "Mostrar en «Restauración»" + texto corto + enlace "Ver sección →". */
export function FurnitureRestorationCardCheck({
  checked, onCheckedChange, idSection, hasBeforeAfter, disabled = false,
}: FurnitureRestorationCardCheckProps) {
  // Sin fotos Antes/Después no se puede ENCENDER (si ya estaba encendido, se deja apagar)
  const cannotTurnOn = !hasBeforeAfter && !checked

  return (
    <FurnitureShortcutCheck
      id="furniture-show-on-restoration"
      checked={checked}
      onCheckedChange={onCheckedChange}
      disabled={disabled || cannotTurnOn}
      label="Mostrar en «Restauración» (página Servicios)"
      description="Su tarjeta compara la foto Antes con la Después."
      warning={!hasBeforeAfter ? 'Necesita una foto Antes y una Después en su galería.' : null}
      // Enlace a la pestaña Trabajos (items) de esa sección (solo si el backend mandó la sección)
      sectionHref={idSection != null ? `/sections/${idSection}?tab=items` : null}
    />
  )
}
