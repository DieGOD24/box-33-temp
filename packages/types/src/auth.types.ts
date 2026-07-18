export type UserRole = 'owner'

export interface AuthUser {
  id: string
  email: string
  name: string
  role: UserRole
}

export interface LoginInput {
  email: string
  password: string
}

export interface AuthResponse {
  accessToken: string
  user: AuthUser
}
