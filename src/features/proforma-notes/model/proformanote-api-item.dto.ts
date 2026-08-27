// src/features/proforma-notes/model/proformanote-api-item.dto.ts
export type ProformaNoteApiItem = {
  id: number
  proforma_id: number
  text: string
  order: number | null
  created_at: string
  updated_at: string | null
}
