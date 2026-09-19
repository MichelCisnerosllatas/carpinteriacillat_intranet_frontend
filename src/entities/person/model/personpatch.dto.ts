import type { PersonType } from './person.type'

export type PersonPatchRequestDto = {
  person_name?: string;
  person_lastname?: string;
  person_photo_url?: string | null;
  id_tipodoc?: number;
  person_numdoc?: string;
  person_state?: number;
}

export type PersonPatchResponseDto = {
  success: boolean;
  status: number;
  message: string;
  data: PersonType | null;
  errors?: Record<string, string[]>;
}
