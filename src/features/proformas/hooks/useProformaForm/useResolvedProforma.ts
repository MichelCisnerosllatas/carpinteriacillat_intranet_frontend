// src/features/proformas/hooks/useProformaForm/useResolvedProforma.ts
'use client'

import { useEffect } from 'react'
import { useProformaListStore } from '../../stores/useProformaListStore'

/**
 * Resuelve la proforma que se está editando: primero busca en `currentItem` (la que dejó
 * seteada la tabla al hacer clic en "Editar"); si no coincide, busca en la lista ya cargada
 * (`items`); si tampoco está ahí, dispara `loadOne` para traerla del backend — esto cubre a
 * quien entra directo por URL sin pasar por la tabla.
 *
 * También deriva el estado de carga/error a mostrar mientras `resolved` sigue en `null`, para
 * que el formulario no se quede vacío en silencio.
 */
export function useResolvedProforma(isEdit: boolean, id?: string) {
  const { currentItem, items, loadOne, isFetching, isError, message } = useProformaListStore()

  const resolved =
    currentItem && String(currentItem.id) === id
      ? currentItem
      : id
        ? (items.find((i) => String(i.id) === id) ?? null)
        : null

  useEffect(() => {
    if (isEdit && id && !resolved) {
      void loadOne(Number(id))
    }
  }, [isEdit, id, resolved])

  const isLoadingProforma = isEdit && !resolved && isFetching
  const proformaLoadError = isEdit && !resolved && isError ? message : null

  return { resolved, isLoadingProforma, proformaLoadError }
}
