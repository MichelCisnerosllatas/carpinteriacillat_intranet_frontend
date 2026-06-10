// src/features/auth/hooks/useLogoutHandler.ts
'use client'

import Swal from 'sweetalert2'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/features/auth/stores/auth.store'
import { baseSwal } from '@/shared/lib/swal'

export function useLogoutHandler() {
  const router = useRouter()
  const { logout } = useAuthStore()

  const handleLogout = async () => {
    const result = await baseSwal<boolean>({
      title: '¿Deseas cerrar sesión?',
      text: 'Se cerrará tu sesión actual.',
      icon: 'warning',

      showCancelButton: true,
      confirmButtonText: 'Sí',
      cancelButtonText: 'No',

      reverseButtons: true,
      showLoaderOnConfirm: true,

      allowOutsideClick: () => !Swal.isLoading(),
      allowEscapeKey: () => !Swal.isLoading(),
      allowEnterKey: () => !Swal.isLoading(),

      preConfirm: async () => {
        try {
          const ok = await logout()

          if (!ok) {
            throw new Error('No se pudo cerrar la sesión')
          }

          return true
        } catch {
          Swal.showValidationMessage('No se pudo cerrar la sesión.')
          return false
        }
      },
    })

    if (result.isConfirmed) {
      router.replace('/sign-in')
      await baseSwal({
        title: 'Sesión cerrada',
        text: 'Redirigiendo al inicio de sesión...',
        icon: 'success',
        timer: 1300,
        showConfirmButton: false,
        allowOutsideClick: false,
        allowEscapeKey: false,
      })
    }
  }

  return {
    handleLogout,
  }
}
// // src/features/auth/hooks/uselogoutHandle.ts
// 'use client'
//
// import Swal from 'sweetalert2'
// import { useRouter } from 'next/navigation'
// import { useAuthStore } from '@/features/auth/stores/auth.store'
//
// export function useLogoutHandler() {
//   const router = useRouter()
//   const { logout } = useAuthStore()
//
//   const handleLogout = async () => {
//     const result = await Swal.fire({
//       title: '¿Deseas cerrar sesión?',
//       text: 'Se cerrará tu sesión actual.',
//       icon: 'warning',
//
//       showCancelButton: true,
//       confirmButtonText: 'Sí',
//       cancelButtonText: 'No',
//
//       reverseButtons: true,
//       showLoaderOnConfirm: true,
//
//       allowOutsideClick: () => !Swal.isLoading(),
//       allowEscapeKey: () => !Swal.isLoading(),
//       allowEnterKey: () => !Swal.isLoading(),
//
//       preConfirm: async () => {
//         try {
//           const ok = await logout()
//
//           if (!ok) {
//             throw new Error('No se pudo cerrar la sesión')
//           }
//
//           return true
//         } catch {
//           Swal.showValidationMessage('No se pudo cerrar la sesión.')
//           return false
//         }
//       },
//     })
//
//     if (result.isConfirmed) {
//       await Swal.fire({
//         title: 'Sesión cerrada',
//         text: 'Redirigiendo al inicio de sesión...',
//         icon: 'success',
//         timer: 1300,
//         showConfirmButton: false,
//         allowOutsideClick: false,
//         allowEscapeKey: false,
//       })
//
//       router.replace('/sign-in')
//     }
//   }
//
//   return {
//     handleLogout,
//   }
// }