import type { StorageFolderItem } from './storagefolder.get.dto'

export type StorageFolderPatchRequestDto = {
  path_encoded: string
  new_name?:    string
  new_folder?:  string   // target parent path — empty string = root
}

export type StorageFolderMoveRequestDto = {
  path_encoded: string
  new_folder:   string
}

export type StorageFolderPatchResponseDto = {
  success: boolean
  status:  number
  message: string
  data:    StorageFolderItem
}

export type StorageFolderDeleteRequestDto = {
  path_encoded: string
  force?:       boolean
}

export type StorageFolderDeleteResponseDto = {
  success: boolean
  status:  number
  message: string
}
