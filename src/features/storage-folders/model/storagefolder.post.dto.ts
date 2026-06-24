import type { StorageFolderItem } from './storagefolder.get.dto'

export type StorageFolderPostRequestDto = {
  name:         string
  parent_path?: string
}

export type StorageFolderPostResponseDto = {
  success: boolean
  status:  number
  message: string
  data:    StorageFolderItem
}
