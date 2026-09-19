export type PersonType = {
  id_person: number;
  person_name: string;
  person_lastname: string;
  /** Correo — clave de vínculo reutilizada por testimonios/mensajes de contacto/login con Google. */
  person_email: string | null;
  /** Una URL absoluta (proveedor externo, ej. Google) o la URL ya resuelta de una imagen del
   * módulo Images (sin FK viva a esa tabla) — se sincroniza sola con la del proveedor en cada
   * login con Google. */
  person_photo_url: string | null;
  /** Alias de `person_photo_url` — usar este para pintar el avatar (con `getImageUrl`). null = mostrar iniciales. */
  photo_url: string | null;
  id_tipodoc: number;
  person_numdoc: string;
  person_state: number;
  person_created_at: string;
  person_updated_at: string;
}
