'use server'

import type { CreateLeadInput } from '@box33/types'
import { ApiError, apiFetch } from '@/lib/api/client'

export async function createLead(
  input: CreateLeadInput
): Promise<{ ok: boolean; message?: string }> {
  try {
    await apiFetch('/leads', { method: 'POST', body: input })
    return { ok: true }
  } catch (err) {
    return { ok: false, message: err instanceof ApiError ? err.message : undefined }
  }
}
