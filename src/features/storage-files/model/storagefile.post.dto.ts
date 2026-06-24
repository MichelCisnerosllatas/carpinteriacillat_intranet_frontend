import type { StorageFileItem } from './storagefile.get.dto'

export type StorageFilePostResponseDto = {
  success: boolean
  status:  number
  message: string
  data:    StorageFileItem
}
