// src/features/sales/hooks/useSaleDetailPage.ts
'use client'

import { useEffect } from 'react'
import { useSaleListStore } from '../stores/useSaleListStore'

/**
 * Solo estado de React (venta cargada) para la vista de solo lectura `/sales/[id]` — a
 * diferencia de `useProformaDetailPage`, sales no tiene motor de PDF, así que no hay nada que
 * pedir en segundo plano ni ningún tab que gestionar.
 *
 * Siempre se refresca contra el backend al entrar — si el usuario acaba de agregar/editar
 * líneas de detalle o registrar un pago desde el formulario, la copia cacheada en la lista
 * puede estar desfasada (los totales se recalculan en el servidor). El ítem cacheado solo se
 * usa para pintar algo de inmediato mientras llega la respuesta fresca.
 */
export function useSaleDetailPage(id: string) {
  const { currentItem, items, setCurrentItem, loadOne, isFetching } = useSaleListStore()

  useEffect(() => {
    const cached = items.find((i) => String(i.id) === id)
    if (cached) setCurrentItem(cached)
    void loadOne(Number(id))
  }, [id])

  const item = currentItem && String(currentItem.id) === id ? currentItem : null

  const handleRefresh = () => {
    if (!item) return Promise.resolve()
    return loadOne(item.id).then(() => undefined)
  }

  return { item, isFetching, handleRefresh }
}
