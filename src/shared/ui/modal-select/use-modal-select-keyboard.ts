import { useCallback, useEffect, useState } from 'react'

/**
 * Navegación por teclado para <ModalSelect />.
 *
 * - ArrowDown / ArrowUp: mueve el resaltado entre las filas visibles (filtradas).
 * - Enter: confirma la fila resaltada.
 * - El resaltado se reinicia a 0 cada vez que cambia la lista filtrada
 *   (por ejemplo al escribir en el buscador) para que siempre apunte a una fila válida.
 *
 * Uso:
 *   const { highlightedIndex, setHighlightedIndex, onKeyDown } =
 *     useModalSelectKeyboard(filteredList.length, (index) => onSelect(filteredList[index]))
 *
 *   <Input onKeyDown={onKeyDown} ... />
 *   <div onKeyDown={onKeyDown} tabIndex={-1}>...lista...</div>
 */
export function useModalSelectKeyboard(
  itemCount: number,
  onConfirm: (index: number) => void
) {
  const [highlightedIndex, setHighlightedIndex] = useState(0)

  useEffect(() => {
    setHighlightedIndex(0)
  }, [itemCount])

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (itemCount === 0) return

      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setHighlightedIndex((prev) => (prev + 1) % itemCount)
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setHighlightedIndex((prev) => (prev - 1 + itemCount) % itemCount)
      } else if (e.key === 'Enter') {
        e.preventDefault()
        onConfirm(highlightedIndex)
      }
    },
    [itemCount, highlightedIndex, onConfirm]
  )

  return { highlightedIndex, setHighlightedIndex, onKeyDown }
}
