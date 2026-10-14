'use client'

// SOLO para «Restauración» (restoration_compare), al CREAR y al EDITAR.
// Estado del modo par del formulario de imagen:
//   - UN mueble elegido para los dos bloques (al crear se preselecciona el del trabajo).
//   - Dos bloques "Antes" y "Después": cada uno es una foto que, al guardar, se convierte en una
//     fila de sections_images (variant 'before' / 'after').
//   - Al EDITAR además: el id_section_image original de cada bloque (para saber si se actualiza,
//     se crea o se elimina) y si cada foto está visible. Llegan después con loadInitial().
// Se guarda fuera de react-hook-form para que sea simple: el formulario lo lee al guardar.

import { useEffect, useState } from 'react'
import { buildFurnitureGalleryLink, type RestorationPhotoVariant } from '../../../grouped'
import type { ImageSource } from '../coverflow/image-source-tabs'
import type { PickedFurniture } from '../coverflow/furniture-photo-picker'

/** Lo que el usuario eligió en un bloque (Antes o Después). */
export type RestorationSlotValue = {
  /**
   * Qué muestra el bloque para elegir: 'furniture' = zona para soltar una foto del mueble elegido arriba;
   * 'bank' = selector del banco de imágenes. Sin mueble elegido siempre se muestra el banco.
   */
  source: ImageSource
  /** Imagen elegida (null = bloque vacío, no se guarda). */
  idImage: number | null
  /** Para la foto en grande del bloque. */
  imageUrl: string | null
  imageName: string
  /** '/gallery/<id_furniture>' si la foto viene de un mueble; '' si viene del banco. */
  link: string
  /** Pie de foto (opcional). */
  caption: string
}

/** Cambios parciales de un bloque (se mezclan con lo que ya tiene). */
export type RestorationSlotPatch = Partial<RestorationSlotValue>

/** Foto de un mueble que se pone en un bloque (lo mínimo que hace falta). */
export type RestorationFurniturePhoto = { imageId: number; url: string; name: string }

/** Bloque vacío. Por defecto muestra las fotos del mueble (lo normal en Restauración). */
export function emptyRestorationSlot(): RestorationSlotValue {
  return { source: 'furniture', idImage: null, imageUrl: null, imageName: '', link: '', caption: '' }
}

/**
 * Bloque con una foto del mueble puesta: imagen + enlace '/gallery/<id>' + pie de foto
 * (el título del mueble, solo si el pie estaba vacío: no se pisa lo ya escrito).
 */
function withFurniturePhoto(
  slot: RestorationSlotValue,
  photo: RestorationFurniturePhoto,
  furniture: PickedFurniture,
): RestorationSlotValue {
  return {
    ...slot,
    source: 'furniture',
    idImage: photo.imageId,
    imageUrl: photo.url,
    imageName: photo.name,
    link: buildFurnitureGalleryLink(furniture.id),
    caption: slot.caption.trim() ? slot.caption : furniture.title,
  }
}

/** Un bloque con foto, listo para guardar (en orden: primero Antes, luego Después). */
export type FilledRestorationSlot = { variant: RestorationPhotoVariant; slot: RestorationSlotValue }

/** 'create' = se crean fotos nuevas; 'edit' = se editan las fotos ya guardadas de un trabajo. */
export type RestorationPairMode = 'create' | 'edit'

/** Un valor por bloque (Antes y Después). */
export type RestorationPerVariant<T> = Record<RestorationPhotoVariant, T>

/** Valores iniciales al EDITAR (los arma use-restoration-edit-initial.ts). */
export type RestorationPairInitial = {
  /** Mueble del select de arriba (null = sin mueble). */
  furnitureId: number | null
  before: RestorationSlotValue
  after: RestorationSlotValue
  /** id_section_image que tenía cada bloque al abrir el formulario (null = no tenía foto guardada). */
  ids: RestorationPerVariant<number | null>
  /** Visible (1) u oculta (0) de cada bloque. */
  states: RestorationPerVariant<number>
}

/**
 * Estado del mueble compartido y de los bloques Antes / Después.
 * `workFurnitureId` = mueble relacionado del trabajo elegido: al CREAR se preselecciona en el select "Mueble".
 * null (trabajo sin mueble o "Ninguno") → no se preselecciona nada.
 * `mode` = 'create' (por defecto) o 'edit' (los valores llegan después con loadInitial).
 */
export function useRestorationPair(workFurnitureId: number | null, mode: RestorationPairMode = 'create') {
  /** Mueble elegido arriba (lo comparten los dos bloques). */
  const [furnitureId, setFurnitureId] = useState<number | null>(workFurnitureId)
  const [before, setBefore] = useState<RestorationSlotValue>(emptyRestorationSlot)
  const [after, setAfter] = useState<RestorationSlotValue>(emptyRestorationSlot)
  /** Mensaje "elige al menos una foto". */
  const [error, setError] = useState<string | null>(null)

  // Solo al EDITAR: id original de cada bloque, visible/oculta de cada bloque y si ya se cargó todo.
  // Los ids NO se mueven al intercambiar ni al vaciar un bloque: son "la fila guardada de ese bloque".
  const [originalIds, setOriginalIds] = useState<RestorationPerVariant<number | null>>({ before: null, after: null })
  const [slotStates, setSlotStates] = useState<RestorationPerVariant<number>>({ before: 1, after: 1 })
  const [isInitialLoaded, setIsInitialLoaded] = useState(false)

  // Al CREAR: al elegir (o cambiar) el trabajo se preselecciona su mueble. Sus fotos marcadas
  // Antes/Después las coloca restoration-pair-fields.tsx (necesita la lista de muebles para encontrarlas).
  // Al EDITAR no: el mueble viene de lo guardado (loadInitial) y no se debe pisar.
  useEffect(() => {
    if (mode === 'edit') return
    setFurnitureId(workFurnitureId)
  }, [workFurnitureId, mode])

  /** Al EDITAR: pone de una vez el mueble, los dos bloques, sus ids originales y su visibilidad. */
  const loadInitial = (initial: RestorationPairInitial) => {
    setFurnitureId(initial.furnitureId)
    setBefore(initial.before)
    setAfter(initial.after)
    setOriginalIds(initial.ids)
    setSlotStates(initial.states)
    setError(null)
    setIsInitialLoaded(true)
  }

  /** Visible (1) u oculta (0) de un bloque (solo al editar). */
  const setSlotState = (variant: RestorationPhotoVariant, state: number) => {
    setSlotStates((s) => ({ ...s, [variant]: state }))
  }

  /** Olvida el id original de un bloque (ej. su foto ya se eliminó en el backend). */
  const forgetOriginalId = (variant: RestorationPhotoVariant) => {
    setOriginalIds((ids) => ({ ...ids, [variant]: null }))
  }

  /** Cambia un bloque con una función (recibe lo que tiene ahora). */
  const updateSlot = (variant: RestorationPhotoVariant, update: (s: RestorationSlotValue) => RestorationSlotValue) => {
    const set = variant === 'before' ? setBefore : setAfter
    set(update)
  }

  /** Cambia algunos campos de un bloque. Si ya tiene foto, se quita el aviso de error. */
  const patchSlot = (variant: RestorationPhotoVariant, patch: RestorationSlotPatch) => {
    updateSlot(variant, (s) => ({ ...s, ...patch }))
    if (patch.idImage != null) setError(null)
  }

  /**
   * Pone en un bloque una foto del mueble (ver withFurniturePhoto).
   * La usan el arrastre (soltar sobre el bloque) y el menú "Poner en Antes / Después".
   */
  const pickFurniturePhoto = (variant: RestorationPhotoVariant, photo: RestorationFurniturePhoto, furniture: PickedFurniture) => {
    updateSlot(variant, (s) => withFurniturePhoto(s, photo, furniture))
    setError(null)
  }

  /**
   * Coloca las fotos marcadas Antes/Después de un mueble en los dos bloques, REEMPLAZANDO lo que
   * hubiera. Si el mueble no tiene marcada una de las dos, ese bloque queda vacío.
   * Al crear se llama sola al elegir un mueble (o al preseleccionarse el del trabajo).
   * Al editar solo con el link "Volver a las fotos marcadas".
   */
  const placeFurniturePhotos = (
    photos: Record<RestorationPhotoVariant, RestorationFurniturePhoto | null>,
    furniture: PickedFurniture,
  ) => {
    setBefore(photos.before ? withFurniturePhoto(emptyRestorationSlot(), photos.before, furniture) : emptyRestorationSlot())
    setAfter(photos.after ? withFurniturePhoto(emptyRestorationSlot(), photos.after, furniture) : emptyRestorationSlot())
    if (photos.before || photos.after) setError(null)
  }

  /** Intercambia los dos bloques (foto, enlace y pie de foto): al arrastrar la foto de un bloque al otro. */
  const swapSlots = () => {
    setBefore(after)
    setAfter(before)
  }

  /** Vacía un bloque. */
  const clearSlot = (variant: RestorationPhotoVariant) => {
    updateSlot(variant, () => emptyRestorationSlot())
  }

  /** Bloques con foto, en orden (Antes → Después). */
  const filledSlots: FilledRestorationSlot[] = [
    { variant: 'before' as const, slot: before },
    { variant: 'after' as const, slot: after },
  ].filter((x) => x.slot.idImage != null)

  return {
    mode,
    furnitureId, setFurnitureId,
    before, after, patchSlot, pickFurniturePhoto, placeFurniturePhotos, swapSlots, clearSlot, filledSlots,
    error, setError,
    // Solo al editar
    originalIds, forgetOriginalId, slotStates, setSlotState, loadInitial, isInitialLoaded,
  }
}

/** Lo que devuelve useRestorationPair (lo reciben los componentes de los bloques). */
export type RestorationPairState = ReturnType<typeof useRestorationPair>
