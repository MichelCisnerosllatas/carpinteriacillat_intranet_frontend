import { create } from 'zustand'
import { toastError, toastSuccess } from '@/shared/lib/toast'
import { useAuthStore } from '@/features/auth/stores/auth.store'
import { profileService } from '../services/profile.service'
import type {
  ChangeLoginEmailRequestDto,
  ChangePasswordRequestDto,
  ProfileDto,
  ProfileTypeDocDto,
  UpdateProfileRequestDto,
} from '../model/profile.dto'

type State = {
  profile: ProfileDto | null
  isLoading: boolean
  isError: boolean
  message: string | null

  isChangingPassword: boolean
  passwordError: string | null
  passwordFieldErrors: Record<string, string[]> | null

  /** true mientras se sube o se quita la foto de perfil. */
  isSavingPhoto: boolean

  /** Opciones del selector "Tipo de documento". */
  typeDocs: ProfileTypeDocDto[]

  /** Guardado de mis datos personales. */
  isSavingProfile: boolean
  profileError: string | null
  profileFieldErrors: Record<string, string[]> | null

  /** Cambio de mi correo de acceso. */
  isChangingEmail: boolean
  emailError: string | null
  emailFieldErrors: Record<string, string[]> | null
}

type Action = {
  load: () => Promise<void>
  changePassword: (data: ChangePasswordRequestDto) => Promise<boolean>
  resetPasswordState: () => void
  uploadPhoto: (file: File) => Promise<boolean>
  deletePhoto: () => Promise<boolean>
  loadTypeDocs: () => Promise<void>
  updateProfile: (data: UpdateProfileRequestDto) => Promise<boolean>
  resetProfileState: () => void
  changeLoginEmail: (data: ChangeLoginEmailRequestDto) => Promise<boolean>
  resetEmailState: () => void
}

export const useProfileStore = create<State & Action>((set, get) => ({
  profile: null,
  isLoading: false,
  isError: false,
  message: null,

  isChangingPassword: false,
  passwordError: null,
  passwordFieldErrors: null,

  isSavingPhoto: false,

  typeDocs: [],

  isSavingProfile: false,
  profileError: null,
  profileFieldErrors: null,

  isChangingEmail: false,
  emailError: null,
  emailFieldErrors: null,

  load: async () => {
    set({ isLoading: true, isError: false, message: null })
    try {
      const res = await profileService.get()
      if (!res.success) throw new Error(res.message)
      set({ profile: res.data, isLoading: false })
    } catch (error: any) {
      set({
        isLoading: false,
        isError: true,
        message: error?.response?.data?.message ?? error?.message ?? 'No se pudo cargar tu perfil.',
      })
    }
  },

  changePassword: async (data) => {
    set({ isChangingPassword: true, passwordError: null, passwordFieldErrors: null })
    try {
      const res = await profileService.changePassword(data)
      if (!res.success) {
        set({ isChangingPassword: false, passwordError: res.message, passwordFieldErrors: res.errors ?? null })
        return false
      }
      set({ isChangingPassword: false })
      return true
    } catch (error: any) {
      set({
        isChangingPassword: false,
        passwordError: error?.response?.data?.message ?? error?.message ?? 'No se pudo cambiar la contraseña.',
        passwordFieldErrors: error?.response?.data?.errors ?? null,
      })
      return false
    }
  },

  resetPasswordState: () => set({ isChangingPassword: false, passwordError: null, passwordFieldErrors: null }),

  // ── Datos personales ───────────────────────────────────────────────────────

  loadTypeDocs: async () => {
    // Si ya las cargamos antes, no volvemos a pedirlas.
    if (get().typeDocs.length > 0) return
    try {
      const res = await profileService.getTypeDocs()
      if (res.success) set({ typeDocs: res.data })
    } catch {
      toastError('No se pudieron cargar los tipos de documento')
    }
  },

  updateProfile: async (data) => {
    set({ isSavingProfile: true, profileError: null, profileFieldErrors: null })
    try {
      const res = await profileService.update(data)

      if (!res.success || !res.data) {
        set({ isSavingProfile: false, profileError: res.message, profileFieldErrors: res.errors ?? null })
        return false
      }

      // 1. El backend devuelve el perfil completo ya actualizado: lo usamos tal cual.
      set({ profile: res.data, isSavingProfile: false })
      // 2. Refrescamos la sesión para que el nombre del sidebar y del header también cambie.
      await useAuthStore.getState().syncAccess()

      toastSuccess('Datos guardados', res.message)
      return true
    } catch (error: any) {
      set({
        isSavingProfile: false,
        profileError: error?.response?.data?.message ?? error?.message ?? 'No se pudieron guardar tus datos.',
        profileFieldErrors: error?.response?.data?.errors ?? null,
      })
      return false
    }
  },

  resetProfileState: () => set({ isSavingProfile: false, profileError: null, profileFieldErrors: null }),

  // ── Correo de acceso ───────────────────────────────────────────────────────

  changeLoginEmail: async (data) => {
    set({ isChangingEmail: true, emailError: null, emailFieldErrors: null })
    try {
      const res = await profileService.changeLoginEmail(data)

      if (!res.success) {
        set({ isChangingEmail: false, emailError: res.message, emailFieldErrors: res.errors ?? null })
        return false
      }

      // Cambiamos el correo en la pantalla y refrescamos la sesión (sidebar / header).
      const { profile } = get()
      if (profile) set({ profile: { ...profile, email: data.email } })
      await useAuthStore.getState().syncAccess()

      toastSuccess('Correo de acceso actualizado', res.message)
      set({ isChangingEmail: false })
      return true
    } catch (error: any) {
      set({
        isChangingEmail: false,
        emailError: error?.response?.data?.message ?? error?.message ?? 'No se pudo cambiar el correo.',
        emailFieldErrors: error?.response?.data?.errors ?? null,
      })
      return false
    }
  },

  resetEmailState: () => set({ isChangingEmail: false, emailError: null, emailFieldErrors: null }),

  // ── Foto de perfil ─────────────────────────────────────────────────────────

  uploadPhoto: async (file) => {
    set({ isSavingPhoto: true })
    try {
      const res = await profileService.uploadPhoto(file)

      if (!res.success) {
        toastError('No se pudo cambiar la foto', res.message)
        set({ isSavingPhoto: false })
        return false
      }

      // 1. Cambiamos la foto en la pantalla de "Mi perfil".
      setPhotoInProfile(res.data?.photo_url ?? null)
      // 2. Refrescamos la sesión para que el avatar del sidebar y del header también cambie.
      await useAuthStore.getState().syncAccess()

      toastSuccess('Foto actualizada', 'Tu nueva foto de perfil ya está visible.')
      set({ isSavingPhoto: false })
      return true
    } catch (error: any) {
      toastError('No se pudo cambiar la foto', getErrorMessage(error))
      set({ isSavingPhoto: false })
      return false
    }
  },

  deletePhoto: async () => {
    set({ isSavingPhoto: true })
    try {
      const res = await profileService.deletePhoto()

      if (!res.success) {
        toastError('No se pudo quitar la foto', res.message)
        set({ isSavingPhoto: false })
        return false
      }

      setPhotoInProfile(null)
      await useAuthStore.getState().syncAccess()

      toastSuccess('Foto eliminada', 'Ahora se mostrarán tus iniciales.')
      set({ isSavingPhoto: false })
      return true
    } catch (error: any) {
      toastError('No se pudo quitar la foto', getErrorMessage(error))
      set({ isSavingPhoto: false })
      return false
    }
  },
}))

/** Cambia solo la foto dentro del perfil ya cargado (sin volver a pedirlo al backend). */
function setPhotoInProfile(photoUrl: string | null) {
  const { profile } = useProfileStore.getState()
  if (!profile || !profile.person) return

  useProfileStore.setState({
    profile: {
      ...profile,
      person: { ...profile.person, photo_url: photoUrl },
    },
  })
}

/** Saca el mensaje de error más útil: primero el del backend, luego el de Axios. */
function getErrorMessage(error: any): string {
  const fieldErrors = error?.response?.data?.errors?.photo
  if (fieldErrors?.length) return fieldErrors[0]
  return error?.response?.data?.message ?? error?.message ?? 'Error inesperado.'
}
