// src/features/clients/model/client-api-item.dto.ts
export type ClientApiItem = {
  id: number
  id_typedoc: number | null
  business_name: string
  document_number: string | null
  address: string | null
  contact_person: string | null
  phone: string | null
  email: string | null
  status: number
  created_at: string
  updated_at: string | null
}

export type ClientJoinApiItem = ClientApiItem & {
  type_doc: {
    id_typedoc: number
    typedoc_name: string
    typedoc_description: string | null
  } | null
}
