import type { MetaPaginationType } from '@/shared/type/metaPagination.type'
import type { LinksPaginationType } from '@/shared/type/linksPagination.type'

export type StorageFileItem = {
  path: string
  url: string
  last_modified: number | null
}

export type StorageListRequestDto = {
  folder?: string
  per_page?: number
  page?: number
}

export type StorageListResponseDto = {
  success: boolean
  message: string
  data: StorageFileItem[]
  links: LinksPaginationType
  meta: MetaPaginationType
}

export type StorageExistsResponseDto = {
  success: boolean
  message: string
  data: {
    path: string
    url: string
    exists: boolean
  }
}

export type StorageDeleteResponseDto = {
  success: boolean
  message: string
}

export type StorageMoveRequestDto = {
  old_path: string
  new_name?: string
  new_folder?: string
}

export type StorageMoveResponseDto = {
  success: boolean
  message: string
  data: {
    old_path: string
    new_path: string
    url: string
  }
}

export type DbImageRecord = {
  id_image: number
  image_name: string | null
  image_patch: string
  image_type: string | null
  image_size: number | null
  image_width: number | null
  image_height: number | null
  image_title: string | null
  image_alt: string | null
  image_created_at: string | null
}

export type DbImageListResponseDto = {
  success: boolean
  message: string
  data: DbImageRecord[]
}
