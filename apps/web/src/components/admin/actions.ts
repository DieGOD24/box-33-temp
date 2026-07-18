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
import { requireSession } from '@/lib/auth/session'

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

async function run(fn: (token: string) => Promise<unknown>): Promise<ActionResult> {
  const token = await requireSession()
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
  return run((t) => admin.updateWod(t, input))
}

export async function saveChallenge(input: UpdateChallengeInput): Promise<ActionResult> {
  return run((t) => admin.updateChallenge(t, input))
}

export async function savePodium(input: UpdatePodiumInput): Promise<ActionResult> {
  return run((t) => admin.updatePodium(t, input))
}

export async function saveSchedule(input: UpdateScheduleInput): Promise<ActionResult> {
  return run((t) => admin.updateSchedule(t, input))
}

export async function saveSettings(input: UpdateSettingsInput): Promise<ActionResult> {
  return run((t) => admin.updateSettings(t, input))
}

export async function savePlan(key: string, input: UpdatePlanInput): Promise<ActionResult> {
  return run((t) => admin.updatePlan(t, key, input))
}

export async function addProduct(input: CreateProductInput): Promise<ActionResult> {
  return run((t) => admin.createProduct(t, input))
}

export async function editProduct(id: string, input: UpdateProductInput): Promise<ActionResult> {
  return run((t) => admin.updateProduct(t, id, input))
}

export async function removeProduct(id: string): Promise<ActionResult> {
  return run((t) => admin.deleteProduct(t, id))
}

export async function toggleStock(id: string): Promise<ActionResult> {
  return run((t) => admin.toggleProductStock(t, id))
}

export async function markOrderStatus(id: string, status: string): Promise<ActionResult> {
  return run((t) => admin.updateOrderStatus(t, id, status))
}

export async function wipeLeads(): Promise<ActionResult> {
  return run((t) => admin.clearLeads(t))
}

/** Uploads an image (form field 'file') and returns its public URL. */
export async function uploadPhoto(formData: FormData): Promise<ActionResult> {
  return run((t) => admin.uploadImage(t, formData))
}
