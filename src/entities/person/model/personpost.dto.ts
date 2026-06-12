import type { PersonType } from './person.type'

export type PersonPostRequestDto = {
  person_name: string;
  person_lastname: string;
  id_typedoc: number;
  person_numdoc: string;
  person_state: number;
}

export type PersonPostResponseDto = {
  success: boolean;
  status: number;
  message: string;
  data: PersonType;
  errors?: Record<string, string[]>;
}
