'use client'

import { useRef } from 'react'
import { Camera, Loader2, Trash2 } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar'
import { Button } from '@/shared/ui/button'
import { getInitials } from '@/shared/lib/get-initials'
import { toastError } from '@/shared/lib/toast'
import { swalConfirm } from '@/shared/lib/swal'
import { useProfileStore } from '../stores/useProfileStore'

/** Tamaño máximo permitido para la foto, en MB. */
const MAX_SIZE_MB = 5

type ProfilePhotoFieldProps = {
  /** URL de la foto actual, ya lista para mostrarse (o '' si no tiene). */
  photo: string
  /** Nombre completo: se usa para las iniciales cuando no hay foto. */
  fullName: string
  /** false = solo se muestra (modo lectura); true = se puede cambiar o quitar (modo edición). */
  editable?: boolean
}

/**
 * Foto de "Mi perfil".
 * - Modo lectura: solo se ve la foto.
 * - Modo edición: clic en la foto (o en la cámara) → se abre el selector de archivos y la foto
 *   se sube al instante; "Quitar foto" → pide confirmación y la elimina.
 */
export function ProfilePhotoField({ photo, fullName, editable = true }: ProfilePhotoFieldProps) {
  // Referencia al <input type="file"> oculto, para abrirlo desde el botón.
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isSavingPhoto = useProfileStore((state) => state.isSavingPhoto)
  const uploadPhoto = useProfileStore((state) => state.uploadPhoto)
  const deletePhoto = useProfileStore((state) => state.deletePhoto)

  const hasPhoto = photo !== ''

  // Abre la ventana del sistema para elegir un archivo.
  const openFilePicker = () => {
    fileInputRef.current?.click()
  }

  // Se ejecuta cuando el usuario elige un archivo.
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    // Limpiamos el input para poder volver a elegir el mismo archivo si hace falta.
    event.target.value = ''

    if (!file) return

    // Validación 1: que sea una imagen.
    if (!file.type.startsWith('image/')) {
      toastError('Archivo inválido', 'Selecciona una imagen (JPG, PNG o WEBP).')
      return
    }

    // Validación 2: que no pase del tamaño máximo.
    const maxSizeInBytes = MAX_SIZE_MB * 1024 * 1024
    if (file.size > maxSizeInBytes) {
      toastError('Imagen muy pesada', `La foto no debe superar los ${MAX_SIZE_MB}MB.`)
      return
    }

    await uploadPhoto(file)
  }

  // Pide confirmación antes de quitar la foto.
  const handleRemove = async () => {
    const confirmed = await swalConfirm({
      title: '¿Quitar tu foto de perfil?',
      text: 'Se mostrarán tus iniciales en su lugar.',
      confirmText: 'Sí, quitar',
      danger: true,
    })

    if (confirmed) {
      await deletePhoto()
    }
  }

  // Modo lectura: solo la foto, sin cámara ni "Quitar".
  if (!editable) {
    return (
      <Avatar className="size-24 rounded-2xl">
        <AvatarImage src={photo} alt={fullName} className="object-cover" />
        <AvatarFallback className="rounded-2xl text-2xl">{getInitials(fullName)}</AvatarFallback>
      </Avatar>
    )
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={openFilePicker}
        disabled={isSavingPhoto}
        aria-label="Cambiar foto de perfil"
        className="group relative rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed"
      >
        <Avatar className="size-24 rounded-2xl transition-opacity group-hover:opacity-80">
          <AvatarImage src={photo} alt={fullName} className="object-cover" />
          <AvatarFallback className="rounded-2xl text-2xl">{getInitials(fullName)}</AvatarFallback>
        </Avatar>

        {/* Capa oscura con spinner mientras se guarda */}
        {isSavingPhoto && (
          <span className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/50">
            <Loader2 className="size-6 animate-spin text-white" />
          </span>
        )}

        {/* Ícono de cámara en la esquina */}
        <span className="absolute -right-1 -bottom-1 flex size-8 items-center justify-center rounded-full border-2 border-background bg-primary text-primary-foreground shadow transition-transform group-hover:scale-110">
          <Camera className="size-4" />
        </span>
      </button>

      <p className="text-xs text-muted-foreground">JPG, PNG o WEBP · máx. {MAX_SIZE_MB}MB</p>

      {hasPhoto && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleRemove}
          disabled={isSavingPhoto}
          className="h-7 text-destructive hover:text-destructive"
        >
          <Trash2 className="size-3.5" />
          Quitar foto
        </Button>
      )}

      {/* Input real de archivos: oculto, se abre con el botón de arriba */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  )
}
