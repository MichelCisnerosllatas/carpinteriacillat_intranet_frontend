import apiClient from '@/shared/api/apiClient'
import { PROFORMA_TEMPLATE_TEXTS_ENDPOINTS } from './proforma-template-texts.endpoint'
import type {
  ProformaTemplateTextListRequestDto,
  ProformaTemplateTextListResponseDto,
} from '../model/proformatemplatetextget.dto'
import type {
  ProformaTemplateTextPostRequestDto,
  ProformaTemplateTextPostResponseDto,
} from '../model/proformatemplatetextpost.dto'
import type {
  ProformaTemplateTextPutRequestDto,
  ProformaTemplateTextPutResponseDto,
} from '../model/proformatemplatetextput.dto'

export const proformaTemplateTextsService = {
  getList: async (
    param: ProformaTemplateTextListRequestDto
  ): Promise<ProformaTemplateTextListResponseDto> => {
    const params = Object.fromEntries(
      Object.entries(param).filter(([, v]) => v !== undefined && v !== null)
    )
    // Timeout más corto que el default (40s) de apiClient: esta lista se pide junto con el
    // preview-style de la plantilla, y el backend local (php artisan serve) procesa una request
    // a la vez (ver proformas.md) — mejor fallar rápido con el botón de "Reintentar" que dejar
    // al usuario esperando 40s sin feedback.
    const { data } = await apiClient.get<ProformaTemplateTextListResponseDto>(
      PROFORMA_TEMPLATE_TEXTS_ENDPOINTS.v1.get,
      { params, timeout: 15000 }
    )
    return data
  },

  post: async (
    param: ProformaTemplateTextPostRequestDto
  ): Promise<ProformaTemplateTextPostResponseDto> => {
    const { data } = await apiClient.post<ProformaTemplateTextPostResponseDto>(
      PROFORMA_TEMPLATE_TEXTS_ENDPOINTS.v1.post,
      param
    )
    return data
  },

  put: async (
    id: number,
    param: ProformaTemplateTextPutRequestDto
  ): Promise<ProformaTemplateTextPutResponseDto> => {
    const { data } = await apiClient.put<ProformaTemplateTextPutResponseDto>(
      PROFORMA_TEMPLATE_TEXTS_ENDPOINTS.v1.put(id),
      param
    )
    return data
  },

  patch: async (
    id: number,
    param: Partial<ProformaTemplateTextPutRequestDto>
  ): Promise<ProformaTemplateTextPutResponseDto> => {
    const { data } = await apiClient.patch<ProformaTemplateTextPutResponseDto>(
      PROFORMA_TEMPLATE_TEXTS_ENDPOINTS.v1.patch(id),
      param
    )
    return data
  },

  delete: async (id: number): Promise<boolean> => {
    const { data } = await apiClient.delete(PROFORMA_TEMPLATE_TEXTS_ENDPOINTS.v1.delete(id))
    return data.success
  },
}
