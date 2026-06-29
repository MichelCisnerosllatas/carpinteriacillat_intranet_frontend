import { create } from 'zustand'
import { imagesService } from '../services/images.service'
import { useImageListStore } from './useImageListStore'

type State = {
  isLoading: boolean
  error: string | null

  deletingTotal: number
  deletingProcessed: number
  deletingSuccess: number
  deletingFailed: number
  deletingIgnored: number
}

type Action = {
  deleteItem: (id: number) => Promise<boolean>
  bulkDeleteItems: (ids: number[]) => Promise<boolean>
}

type DeleteErrorLevel = 'grave' | 'leve' | 'ignorable'

type DeleteErrorInfo = {
  level: DeleteErrorLevel
  status: number | null
  message: string
}

const chunkArray = <T>(array: T[], size: number): T[][] => {
  const chunks: T[][] = []

  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size))
  }

  return chunks
}

const getChunkSize = (total: number): number => {
  if (total <= 5) return 1
  if (total <= 50) return 5
  if (total <= 300) return 10
  return 20
}

const getHttpStatus = (error: unknown): number | null => {
  const err = error as {
    response?: {
      status?: number
      data?: {
        message?: string
      }
    }
    status?: number
  }

  return err.response?.status ?? err.status ?? null
}

const getErrorMessage = (error: unknown): string => {
  const err = error as {
    response?: {
      data?: {
        message?: string
      }
    }
    message?: string
  }

  return err.response?.data?.message ?? err.message ?? 'Error desconocido'
}

const classifyDeleteError = (error: unknown): DeleteErrorInfo => {
  const status = getHttpStatus(error)
  const message = getErrorMessage(error)

  /**
   * Ignorable:
   * La imagen ya no existe. Para eliminación masiva, esto no debería detener todo.
   */
  if (status === 404) {
    return {
      level: 'ignorable',
      status,
      message: 'La imagen ya no existe o ya fue eliminada.',
    }
  }

  /**
   * Leve:
   * El servidor respondió, pero esa imagen puntual no se pudo eliminar.
   * Por ejemplo: está relacionada, validación, conflicto, etc.
   */
  if (status === 409 || status === 422 || status === 400) {
    return {
      level: 'leve',
      status,
      message,
    }
  }

  /**
   * Grave:
   * Problemas de sesión, permisos, saturación o caída del servidor.
   * Aquí sí conviene detener la eliminación masiva.
   */
  if (
    status === null ||
    status === 401 ||
    status === 403 ||
    status === 429 ||
    status >= 500
  ) {
    return {
      level: 'grave',
      status,
      message,
    }
  }

  /**
   * Por defecto, lo tratamos como leve para no detener toda la operación
   * por un caso puntual.
   */
  return {
    level: 'leve',
    status,
    message,
  }
}

export const useImageDeleteStore = create<State & Action>((set, get) => ({
  isLoading: false,
  error: null,

  deletingTotal: 0,
  deletingProcessed: 0,
  deletingSuccess: 0,
  deletingFailed: 0,
  deletingIgnored: 0,

  deleteItem: async (id) => {
    set({
      isLoading: true,
      error: null,
      deletingTotal: 1,
      deletingProcessed: 0,
      deletingSuccess: 0,
      deletingFailed: 0,
      deletingIgnored: 0,
    })

    try {
      await imagesService.delete(id)

      set({
        deletingProcessed: 1,
        deletingSuccess: 1,
      })

      await useImageListStore.getState().load()

      return true
    } catch (error) {
      const errorInfo = classifyDeleteError(error)

      set({
        deletingProcessed: 1,
        deletingFailed: errorInfo.level === 'ignorable' ? 0 : 1,
        deletingIgnored: errorInfo.level === 'ignorable' ? 1 : 0,
        error: errorInfo.message || 'No se pudo eliminar la imagen.',
      })

      return false
    } finally {
      set({ isLoading: false })
    }
  },

  bulkDeleteItems: async (ids) => {
    const uniqueIds = Array.from(new Set(ids))

    const total = uniqueIds.length
    const chunkSize = getChunkSize(total)
    const chunks = chunkArray(uniqueIds, chunkSize)

    let successCount = 0
    let failedCount = 0
    let ignoredCount = 0
    let processedCount = 0
    let hasSevereError = false
    let severeErrorMessage = ''

    set({
      isLoading: true,
      error: null,
      deletingTotal: total,
      deletingProcessed: 0,
      deletingSuccess: 0,
      deletingFailed: 0,
      deletingIgnored: 0,
    })

    try {
      if (total === 0) {
        return true
      }

      for (const chunk of chunks) {
        if (hasSevereError) break

        const results = await Promise.allSettled(
          chunk.map((id) => imagesService.delete(id))
        )

        for (const result of results) {
          processedCount++

          if (result.status === 'fulfilled') {
            successCount++
          } else {
            const errorInfo = classifyDeleteError(result.reason)

            if (errorInfo.level === 'ignorable') {
              ignoredCount++
            }

            if (errorInfo.level === 'leve') {
              failedCount++
            }

            if (errorInfo.level === 'grave') {
              failedCount++
              hasSevereError = true
              severeErrorMessage = errorInfo.message
            }
          }
        }

        set({
          deletingProcessed: processedCount,
          deletingSuccess: successCount,
          deletingFailed: failedCount,
          deletingIgnored: ignoredCount,
        })
      }

      await useImageListStore.getState().load()

      if (hasSevereError) {
        set({
          error: `El proceso se detuvo por un error grave. Eliminadas: ${successCount}. Fallidas: ${failedCount}. Ignoradas: ${ignoredCount}. Motivo: ${severeErrorMessage}`,
        })

        return false
      }

      if (failedCount > 0) {
        set({
          error: `Se eliminaron ${successCount} imágenes, pero ${failedCount} no pudieron eliminarse. Ignoradas: ${ignoredCount}.`,
        })

        return false
      }

      if (ignoredCount > 0) {
        set({
          error: `Se eliminaron ${successCount} imágenes. ${ignoredCount} ya no existían o ya habían sido eliminadas.`,
        })
      }

      return true
    } catch {
      set({
        error: 'Ocurrió un error inesperado durante la eliminación masiva.',
      })

      return false
    } finally {
      set({ isLoading: false })
    }
  },
}))
// import { create } from 'zustand'
// import { imagesService } from '../services/images.service'
// import { useImageListStore } from './useImageListStore'

// type State = {
//   isLoading: boolean
//   error: string | null
// }

// type Action = {
//   deleteItem: (id: number) => Promise<boolean>
//   bulkDeleteItems: (ids: number[]) => Promise<boolean>
// }

// export const useImageDeleteStore = create<State & Action>((set) => ({
//   isLoading: false,
//   error: null,

//   deleteItem: async (id) => {
//     set({ isLoading: true, error: null })
//     try {
//       await imagesService.delete(id)
//       await useImageListStore.getState().load()
//       return true
//     } catch {
//       set({ error: 'No se pudo eliminar la imagen.' })
//       return false
//     } finally {
//       set({ isLoading: false })
//     }
//   },

//   bulkDeleteItems: async (ids) => {
//     set({ isLoading: true, error: null })
//     try {
//       await Promise.all(ids.map((id) => imagesService.delete(id)))
//       await useImageListStore.getState().load()
//       return true
//     } catch {
//       set({ error: 'No se pudieron eliminar las imágenes.' })
//       return false
//     } finally {
//       set({ isLoading: false })
//     }
//   },
// }))
