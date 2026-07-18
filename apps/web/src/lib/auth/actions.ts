'use server'

import { getLocale } from 'next-intl/server'
import type { AuthResponse } from '@box33/types'
import { redirect } from '@/i18n/navigation'
import { ApiError, apiFetch } from '@/lib/api/client'
import { clearSessionCookie, requireAuth, setSessionCookie } from './session'

export interface LoginState {
  error: boolean
}

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get('email') ?? '')
  const password = String(formData.get('password') ?? '')

  let auth: AuthResponse
  try {
    auth = await apiFetch<AuthResponse>('/auth/login', {
      method: 'POST',
      body: { email, password },
      cache: 'no-store',
    })
  } catch (err) {
    if (err instanceof ApiError) return { error: true }
    throw err
  }

  await setSessionCookie(auth.accessToken)
  const locale = await getLocale()
  redirect({ href: '/admin/resumen', locale })
  return { error: false }
}

export async function logout(): Promise<void> {
  // Verify the caller is authenticated before mutating session state
  // (redirects to the login screen if there's no valid session).
  await requireAuth()
  await clearSessionCookie()
  const locale = await getLocale()
  redirect({ href: '/admin', locale })
}
