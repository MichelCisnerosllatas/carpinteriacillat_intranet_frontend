export type StorageFolderListRequestDto = {
  path?:     string
  search?:   string
  per_page?: number
  page?:     number
}

export type StorageFolderItem = {
  name:                 string
  path:                 string
  path_encoded:         string
  parent_path:          string | null
  parent_path_encoded:  string | null
  depth:                number
  files_count:          number
  subdirectories_count: number
  last_modified:        string | null
}

export type StorageFolderBreadcrumbItem = {
  name:         string
  path:         string
  path_encoded: string
}

export type StorageFolderListMeta = {
  current_page:         number
  last_page:            number
  per_page:             number
  total:                number
  current_path:         string | null
  current_path_encoded: string | null
  parent_path:          string | null
  parent_path_encoded:  string | null
  breadcrumb:           StorageFolderBreadcrumbItem[]
}

export type StorageFolderListResponseDto = {
  success: boolean
  status:  number
  message: string
  data:    StorageFolderItem[]
  links:   { first: string | null; last: string | null; prev: string | null; next: string | null }
  meta:    StorageFolderListMeta
}

// ── Tree (GET /all) ──────────────────────────────────────────────────────────

export type StorageFolderTreeRequestDto = {
  path?:      string
  depth_max?: number
}

export type StorageFolderTreeItem = StorageFolderItem & {
  children: StorageFolderTreeItem[]
}

export type StorageFolderTreeMeta = {
  total_folders:        number
  current_path:         string | null
  current_path_encoded: string | null
  parent_path:          string | null
  parent_path_encoded:  string | null
  breadcrumb:           StorageFolderBreadcrumbItem[]
}

export type StorageFolderTreeResponseDto = {
  success: boolean
  status:  number
  message: string
  data:    StorageFolderTreeItem[]
  meta:    StorageFolderTreeMeta
}
