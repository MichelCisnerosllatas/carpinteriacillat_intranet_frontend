import { create } from 'zustand'
import { rolesService } from '@/features/roles/services/roles.service'
import type { RolePostRequestDto } from '@/features/roles/model/rolepost.dto'
import type { RolePutRequestDto } from '@/features/roles/model/roleput.dto'

type ApiFieldErrors = Record<string, string[]>

type State = {
  isSubmitting: boolean
  error: string | null
  fieldErrors: ApiFieldErrors | null
}

type CreateParams = RolePostRequestDto

type UpdateParams = {
  id: number
  data: RolePutRequestDto
}

type Action = {
  create: (params: CreateParams) => Promise<boolean>
  update: (params: UpdateParams) => Promise<boolean>
  reset: () => void
}

export const useRoleFormStore = create<State & Action>((set) => ({
  isSubmitting: false,
  error: null,
  fieldErrors: null,

  create: async (params) => {
    set({ isSubmitting: true, error: null, fieldErrors: null })

    try {
      const response = await rolesService.post(params)

      if (!response.success) {
        set({
          isSubmitting: false,
          error: response.message || 'No se pudo crear el rol.',
          fieldErrors: response.errors ?? null,
        })
        return false
      }

      set({ isSubmitting: false })
      return true
    } catch (error: any) {
      set({
        isSubmitting: false,
        error: error?.response?.data?.message ?? error?.message ?? 'Error al crear el rol.',
        fieldErrors: error?.response?.data?.errors ?? null,
      })
      return false
    }
  },

  update: async ({ id, data }) => {
    set({ isSubmitting: true, error: null, fieldErrors: null })

    try {
      const hasEmpty = Object.values(data).some((v) => v === null || v === undefined || v === '')
      const response = hasEmpty
        ? await rolesService.patch(id, Object.fromEntries(Object.entries(data).filter(([, v]) => v !== null && v !== undefined && v !== '')) as Partial<RolePutRequestDto>)
        : await rolesService.put(id, data)

      if (!response.success) {
        set({
          isSubmitting: false,
          error: response.message || 'No se pudo actualizar el rol.',
          fieldErrors: response.errors ?? null,
        })
        return false
      }

      set({ isSubmitting: false })
      return true
    } catch (error: any) {
      set({
        isSubmitting: false,
        error: error?.response?.data?.message ?? error?.message ?? 'Error al actualizar el rol.',
        fieldErrors: error?.response?.data?.errors ?? null,
      })
      return false
    }
  },

  reset: () => set({ isSubmitting: false, error: null, fieldErrors: null }),
}))
