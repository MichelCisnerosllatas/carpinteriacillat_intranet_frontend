// src/features/users/stores/useUserFormStore.ts

import { create } from 'zustand'
import { personService } from '@/features/users/services/person.service'
import { userService } from '@/features/users/services/user.service'
import type { PersonPostRequestDto } from '@/entities/person/model/personpost.dto'
import type { PersonPatchRequestDto } from '@/entities/person/model/personpatch.dto'
import type { UserPostRequestDto } from '@/features/users/model/userpost.dto'
import type { UserPatchRequestDto } from '@/features/users/model/userpatch.dto'

type ApiFieldErrors = Record<string, string[]>

type State = {
  isSubmitting: boolean
  error: string | null
  fieldErrors: ApiFieldErrors | null
}

type CreateParams = {
  personData: PersonPostRequestDto
  userData: Omit<UserPostRequestDto, 'id_person'>
}

type UpdateParams = {
  idPerson: number
  idUser: number
  personData: PersonPatchRequestDto
  userData: UserPatchRequestDto
}

type Action = {
  create: (params: CreateParams) => Promise<boolean>
  update: (params: UpdateParams) => Promise<boolean>
  reset: () => void
}

export const useUserFormStore = create<State & Action>((set) => ({
  isSubmitting: false,
  error: null,
  fieldErrors: null,

  create: async ({ personData, userData }) => {
    set({ isSubmitting: true, error: null, fieldErrors: null })

    try {
      const personResponse = await personService.post(personData)

      if (!personResponse.success) {
        set({
          isSubmitting: false,
          error: personResponse.message || 'No se pudo crear la persona.',
          fieldErrors: personResponse.errors ?? null,
        })
        return false
      }

      const userResponse = await userService.post({
        ...userData,
        id_person: personResponse.data.id_person,
      })

      if (!userResponse.success) {
        set({
          isSubmitting: false,
          error: userResponse.message || 'No se pudo crear el usuario.',
          fieldErrors: userResponse.errors ?? null,
        })
        return false
      }

      set({ isSubmitting: false })
      return true
    } catch (error: any) {
      set({
        isSubmitting: false,
        error:       error?.response?.data?.message ?? error?.message ?? 'Error al crear el usuario.',
        fieldErrors: error?.response?.data?.errors ?? null,
      })
      return false
    }
  },

  update: async ({ idPerson, idUser, personData, userData }) => {
    set({ isSubmitting: true, error: null, fieldErrors: null })

    try {
      const [personResponse, userResponse] = await Promise.all([
        personService.patch(idPerson, personData),
        userService.patch(String(idUser), userData),
      ])

      // Recoge errores del primero que falle, priorizando person
      const failed = !personResponse.success ? personResponse
                   : !userResponse.success   ? userResponse
                   : null

      if (failed) {
        set({
          isSubmitting: false,
          error:       failed.message || 'No se pudo actualizar el registro.',
          fieldErrors: failed.errors ?? null,
        })
        return false
      }

      set({ isSubmitting: false })
      return true
    } catch (error: any) {
      set({
        isSubmitting: false,
        error:       error?.response?.data?.message ?? error?.message ?? 'Error al actualizar el usuario.',
        fieldErrors: error?.response?.data?.errors ?? null,
      })
      return false
    }
  },

  reset: () => set({ isSubmitting: false, error: null, fieldErrors: null }),
}))
