// src/types.ts
export interface User {
  id: number
  email: string
  name?: string
  first_name?: string
  last_name?: string
}

export interface TokenResponse {
  access: string
  refresh: string
}

export interface ApiError {
  detail?: string
  [key: string]: string | string[] | undefined
}
