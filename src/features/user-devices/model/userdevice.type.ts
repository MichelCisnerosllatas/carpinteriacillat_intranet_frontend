export type UserDeviceType = {
  id: number
  user_id: number
  access_token_id: string | null
  device_uuid: string | null
  device_name: string | null
  device_type: 'mobile' | 'tablet' | 'desktop' | 'api' | 'unknown'
  platform: 'ios' | 'android' | 'web' | 'desktop' | null
  os: string | null
  os_version: string | null
  device_brand: string | null
  device_model: string | null
  app_name: string | null
  app_version: string | null
  browser: string | null
  browser_version: string | null
  ip_address: string | null
  is_active: boolean
  login_at: string
  last_seen_at: string | null
  logout_at: string | null
  device_created_at: string
  device_updated_at: string
  user?: UserDeviceUserType
}

export type UserDeviceUserType = {
  id: number
  email: string
  user_state: number
  person: {
    id_person: number
    person_name: string
    person_lastname: string
    person_numdoc: string | null
  } | null
  role: {
    id_rol: number
    role_name: string
    role_description: string | null
  } | null
}
