'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import type {
  CreateProductInput,
  UpdateChallengeInput,
  UpdatePlanInput,
  UpdatePodiumInput,
  UpdateProductInput,
  UpdateScheduleInput,
  UpdateSettingsInput,
  UpdateWodInput,
} from '@box33/types'
import { ApiError } from '@/lib/api/client'
import * as admin from '@/lib/api/admin'
import { requireAuth } from '@/lib/auth/session'

export interface ActionResult {
  ok: boolean
  message?: string
  url?: string
}

/** Public pages read tag-cached data — refresh both tags and the tree. */
function refreshPublic(): void {
  revalidateTag('content', 'max')
  revalidateTag('products', 'max')
  revalidatePath('/', 'layout')
}

/**
 * Runs an authenticated admin mutation and normalizes the result. Auth is
 * enforced by each action calling `requireAuth()` first (kept visible in
 * every exported action so the auth gate is obvious at the call site), then
 * passing the token here.
 */
async function run(
  token: string,
  fn: (token: string) => Promise<unknown>,
): Promise<ActionResult> {
  try {
    const result = await fn(token)
    refreshPublic()
    if (result && typeof result === 'object' && 'url' in result) {
      return { ok: true, url: (result as { url: string }).url }
    }
    return { ok: true }
  } catch (err) {
    return { ok: false, message: err instanceof ApiError ? err.message : undefined }
  }
}

export async function saveWod(input: UpdateWodInput): Promise<ActionResult> {
  const token = await requireAuth()
  return run(token, (t) => admin.updateWod(t, input))
}

export async function saveChallenge(input: UpdateChallengeInput): Promise<ActionResult> {
  const token = await requireAuth()
  return run(token, (t) => admin.updateChallenge(t, input))
}

export async function savePodium(input: UpdatePodiumInput): Promise<ActionResult> {
  const token = await requireAuth()
  return run(token, (t) => admin.updatePodium(t, input))
}

export async function saveSchedule(input: UpdateScheduleInput): Promise<ActionResult> {
  const token = await requireAuth()
  return run(token, (t) => admin.updateSchedule(t, input))
}

export async function saveSettings(input: UpdateSettingsInput): Promise<ActionResult> {
  const token = await requireAuth()
  return run(token, (t) => admin.updateSettings(t, input))
}

export async function savePlan(key: string, input: UpdatePlanInput): Promise<ActionResult> {
  const token = await requireAuth()
  return run(token, (t) => admin.updatePlan(t, key, input))
}

export async function addProduct(input: CreateProductInput): Promise<ActionResult> {
  const token = await requireAuth()
  return run(token, (t) => admin.createProduct(t, input))
}

export async function editProduct(id: string, input: UpdateProductInput): Promise<ActionResult> {
  const token = await requireAuth()
  return run(token, (t) => admin.updateProduct(t, id, input))
}

export async function removeProduct(id: string): Promise<ActionResult> {
  const token = await requireAuth()
  return run(token, (t) => admin.deleteProduct(t, id))
}

export async function toggleStock(id: string): Promise<ActionResult> {
  const token = await requireAuth()
  return run(token, (t) => admin.toggleProductStock(t, id))
}

export async function markOrderStatus(id: string, status: string): Promise<ActionResult> {
  const token = await requireAuth()
  return run(token, (t) => admin.updateOrderStatus(t, id, status))
}

export async function wipeLeads(): Promise<ActionResult> {
  const token = await requireAuth()
  return run(token, (t) => admin.clearLeads(t))
}

/** Uploads an image (form field 'file') and returns its public URL. */
export async function uploadPhoto(formData: FormData): Promise<ActionResult> {
  const token = await requireAuth()
  return run(token, (t) => admin.uploadImage(t, formData))
}
