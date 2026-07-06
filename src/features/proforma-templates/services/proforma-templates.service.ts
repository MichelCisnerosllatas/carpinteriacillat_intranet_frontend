import apiClient from '@/shared/api/apiClient'
import { PROFORMA_TEMPLATES_ENDPOINTS } from './proforma-templates.endpoint'
import { PDF_TEMPLATE_MODULE } from '../data/data'
import type {
  ProformaTemplateListRequestDto,
  ProformaTemplateListResponseDto,
  ProformaTemplateJoinListResponseDto,
  ProformaTemplateGetByIdResponseDto,
} from '../model/proformatemplateget.dto'
import type {
  ProformaTemplatePostRequestDto,
  ProformaTemplatePostResponseDto,
} from '../model/proformatemplatepost.dto'
import type {
  ProformaTemplatePutRequestDto,
  ProformaTemplatePutResponseDto,
} from '../model/proformatemplateput.dto'

export const proformaTemplatesService = {
  getList: async (
    param: ProformaTemplateListRequestDto
  ): Promise<ProformaTemplateJoinListResponseDto> => {
    const params = Object.fromEntries(
      Object.entries({ ...param, module: param.module ?? PDF_TEMPLATE_MODULE }).filter(
        ([, v]) => v !== undefined && v !== null && v !== ''
      )
    )
    const { data } = await apiClient.get<ProformaTemplateJoinListResponseDto>(
      PROFORMA_TEMPLATES_ENDPOINTS.v1.getJoin,
      { params }
    )
    return data
  },

  getById: async (id: number): Promise<ProformaTemplateGetByIdResponseDto> => {
    const { data } = await apiClient.get<ProformaTemplateGetByIdResponseDto>(
      `${PROFORMA_TEMPLATES_ENDPOINTS.v1.getJoin}/${id}`
    )
    return data
  },

  getForSelect: async (): Promise<ProformaTemplateListResponseDto> => {
    const { data } = await apiClient.get<ProformaTemplateListResponseDto>(
      PROFORMA_TEMPLATES_ENDPOINTS.v1.get,
      {
        params: { module: PDF_TEMPLATE_MODULE, page: 1, per_page: 100 },
      }
    )
    return data
  },

  post: async (param: ProformaTemplatePostRequestDto): Promise<ProformaTemplatePostResponseDto> => {
    const { data } = await apiClient.post<ProformaTemplatePostResponseDto>(
      PROFORMA_TEMPLATES_ENDPOINTS.v1.post,
      param
    )
    return data
  },

  put: async (
    id: number,
    param: ProformaTemplatePutRequestDto
  ): Promise<ProformaTemplatePutResponseDto> => {
    const { data } = await apiClient.put<ProformaTemplatePutResponseDto>(
      PROFORMA_TEMPLATES_ENDPOINTS.v1.put(id),
      param
    )
    return data
  },

  patch: async (
    id: number,
    param: Partial<ProformaTemplatePutRequestDto>
  ): Promise<ProformaTemplatePutResponseDto> => {
    const { data } = await apiClient.patch<ProformaTemplatePutResponseDto>(
      PROFORMA_TEMPLATES_ENDPOINTS.v1.patch(id),
      param
    )
    return data
  },

  delete: async (id: number): Promise<boolean> => {
    const { data } = await apiClient.delete(PROFORMA_TEMPLATES_ENDPOINTS.v1.delete(id))
    return data.success
  },
}
