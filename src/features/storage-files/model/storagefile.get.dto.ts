export type StorageFileListRequestDto = {
  path?:      string
  search?:    string
  extension?: string
  per_page?:  number
  page?:      number
}

export type StorageFileItem = {
  name:                 string
  path:                 string
  path_encoded:         string
  url:                  string
  parent_path:          string | null
  parent_path_encoded:  string | null
  extension:            string
  mime_type:            string
  size:                 number
  size_human:           string
  last_modified:        string
}

export type StorageFileListMeta = {
  current_page:         number
  last_page:            number
  per_page:             number
  total:                number
  current_path:         string | null
  current_path_encoded: string | null
  parent_path:          string | null
  parent_path_encoded:  string | null
  breadcrumb:           { name: string; path: string; path_encoded: string }[]
}

export type StorageFileListResponseDto = {
  success: boolean
  status:  number
  message: string
  data:    StorageFileItem[]
  links:   { first: string | null; last: string | null; prev: string | null; next: string | null }
  meta:    StorageFileListMeta
}
