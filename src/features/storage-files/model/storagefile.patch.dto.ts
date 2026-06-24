import type { StorageFileItem } from './storagefile.get.dto'

export type StorageFilePatchRequestDto = {
  path_encoded:  string
  new_name?:     string
  new_folder?:   string
}

export type StorageFilePatchResponseDto = {
  success: boolean
  status:  number
  message: string
  data:    StorageFileItem
}

export type StorageFileDeleteRequestDto = {
  path_encoded: string
}

export type StorageFileDeleteResponseDto = {
  success: boolean
  status:  number
  message: string
}
