import { cookies } from 'next/headers'
import { redirect } from '@/i18n/navigation'
import { getLocale } from 'next-intl/server'

export const SESSION_COOKIE = 'box33_session'
const MAX_AGE_SECONDS = 7 * 24 * 60 * 60

export async function getSessionToken(): Promise<string | null> {
  const store = await cookies()
  return store.get(SESSION_COOKIE)?.value ?? null
}

/** Returns the API JWT or redirects to the login screen. */
export async function requireAuth(): Promise<string> {
  const token = await getSessionToken()
  if (!token) {
    const locale = await getLocale()
    redirect({ href: '/admin', locale })
  }
  return token as string
}

export async function setSessionCookie(token: string): Promise<void> {
  const store = await cookies()
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: MAX_AGE_SECONDS,
  })
}

export async function clearSessionCookie(): Promise<void> {
  const store = await cookies()
  store.delete(SESSION_COOKIE)
}
