'use client'

import { useActionState } from 'react'
import { useTranslations } from 'next-intl'
import { login, type LoginState } from '@/lib/auth/actions'

const LABEL =
  'block font-condensed text-xs font-semibold uppercase tracking-[2px] text-bone/60 mb-[5px]'
const INPUT =
  'w-full box-border bg-carbon-deep border border-bone/20 px-3.5 py-3 text-base text-bone mb-4'

export function LoginForm() {
  const t = useTranslations('admin.login')
  const [state, formAction, pending] = useActionState<LoginState, FormData>(login, {
    error: false,
  })

  return (
    <form action={formAction}>
      <label htmlFor="login-email" className={LABEL}>
        {t('emailLabel')}
      </label>
      <input
        id="login-email"
        name="email"
        type="email"
        required
        autoComplete="email"
        className={INPUT}
      />
      <label htmlFor="login-password" className={LABEL}>
        {t('passwordLabel')}
      </label>
      <input
        id="login-password"
        name="password"
        type="password"
        required
        minLength={8}
        autoComplete="current-password"
        className={INPUT}
      />
      {state.error && <p className="text-ember mb-4 text-sm">{t('error')}</p>}
      <button
        type="submit"
        disabled={pending}
        className="bg-bone font-condensed w-full cursor-pointer px-6 py-3.5 text-lg font-bold tracking-[2.5px] text-[#20211b] uppercase transition-colors hover:bg-white disabled:opacity-60"
      >
        {t('submit')}
      </button>
    </form>
  )
}
