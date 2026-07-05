import apiClient from '@/shared/api/apiClient'
import { COMPANY_BANK_ACCOUNTS_ENDPOINTS } from './company-bank-accounts.endpoint'
import type {
  CompanyBankAccountListRequestDto,
  CompanyBankAccountListResponseDto,
} from '../model/companybankaccountget.dto'
import type {
  CompanyBankAccountPostRequestDto,
  CompanyBankAccountPostResponseDto,
} from '../model/companybankaccountpost.dto'
import type {
  CompanyBankAccountPutRequestDto,
  CompanyBankAccountPutResponseDto,
} from '../model/companybankaccountput.dto'

export const companyBankAccountsService = {
  getList: async (param: CompanyBankAccountListRequestDto): Promise<CompanyBankAccountListResponseDto> => {
    const params = Object.fromEntries(
      Object.entries(param).filter(([_, v]) => v !== undefined && v !== null && v !== '')
    )
    const { data } = await apiClient.get<CompanyBankAccountListResponseDto>(
      COMPANY_BANK_ACCOUNTS_ENDPOINTS.v1.get,
      { params }
    )
    return data
  },

  post: async (param: CompanyBankAccountPostRequestDto): Promise<CompanyBankAccountPostResponseDto> => {
    const { data } = await apiClient.post<CompanyBankAccountPostResponseDto>(
      COMPANY_BANK_ACCOUNTS_ENDPOINTS.v1.post,
      param
    )
    return data
  },

  put: async (id: number, param: CompanyBankAccountPutRequestDto): Promise<CompanyBankAccountPutResponseDto> => {
    const { data } = await apiClient.put<CompanyBankAccountPutResponseDto>(
      COMPANY_BANK_ACCOUNTS_ENDPOINTS.v1.put(id),
      param
    )
    return data
  },

  patch: async (
    id: number,
    param: Partial<CompanyBankAccountPutRequestDto>
  ): Promise<CompanyBankAccountPutResponseDto> => {
    const { data } = await apiClient.patch<CompanyBankAccountPutResponseDto>(
      COMPANY_BANK_ACCOUNTS_ENDPOINTS.v1.patch(id),
      param
    )
    return data
  },

  delete: async (id: number): Promise<boolean> => {
    const { data } = await apiClient.delete(COMPANY_BANK_ACCOUNTS_ENDPOINTS.v1.delete(id))
    return data.success
  },
}
