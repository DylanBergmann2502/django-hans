// src/types.ts
export interface User {
  id: number
  email: string
  display?: string
  has_usable_password?: boolean
  name?: string
  first_name?: string
  last_name?: string
}

export interface AuthResponse {
  status: number
  data?: {
    user?: User
    access_token?: string
    refresh_token?: string
  }
  meta?: {
    is_authenticated?: boolean
    access_token?: string
    refresh_token?: string
  }
}

export interface ApiError {
  detail?: string
  errors?: Array<{ param?: string; message?: string }>
  [key: string]: string | string[] | undefined
}
