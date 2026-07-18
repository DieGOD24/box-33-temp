import { getLocale } from 'next-intl/server'
import type {
  DashboardStats,
  Lead,
  Order,
  Paginated,
  PaymentRecord,
  Plan,
  Product,
  SiteContent,
  UpdateChallengeInput,
  UpdatePlanInput,
  UpdatePodiumInput,
  UpdateScheduleInput,
  UpdateSettingsInput,
  UpdateWodInput,
  CreateProductInput,
  UpdateProductInput,
} from '@box33/types'
import { redirect } from '@/i18n/navigation'
import { ApiError, apiFetch } from './client'
import { getSiteContent } from './queries'

const API_URL = process.env['API_URL'] ?? 'http://localhost:3001'

/** Authenticated server-side fetch; a 401 bounces to the login screen. */
async function adminFetch<T>(
  path: string,
  token: string,
  options: { method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'; body?: unknown } = {}
): Promise<T> {
  try {
    return await apiFetch<T>(path, { ...options, token, cache: 'no-store' })
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      const locale = await getLocale()
      redirect({ href: '/admin', locale })
    }
    throw err
  }
}

// ── Reads ─────────────────────────────────────────────────────────────────────

export const getStats = (token: string) => adminFetch<DashboardStats>('/admin/stats', token)

export const getAdminProducts = (token: string, q?: string) =>
  adminFetch<Product[]>(`/admin/products${q ? `?q=${encodeURIComponent(q)}` : ''}`, token)

export const getAdminContent = (): Promise<SiteContent> => getSiteContent()

export const getAdminPlans = (token: string) => adminFetch<Plan[]>('/admin/plans', token)

export const getOrders = (token: string, page = 1) =>
  adminFetch<Paginated<Order>>(`/admin/orders?page=${page}&limit=20`, token)

export const getPayments = (token: string, page = 1) =>
  adminFetch<Paginated<PaymentRecord>>(`/admin/payments?page=${page}&limit=20`, token)

export const getLeads = (token: string, page = 1) =>
  adminFetch<Paginated<Lead>>(`/admin/leads?page=${page}&limit=50`, token)

// ── Mutations ─────────────────────────────────────────────────────────────────

export const updateSettings = (token: string, input: UpdateSettingsInput) =>
  adminFetch('/admin/settings', token, { method: 'PUT', body: input })

export const updateWod = (token: string, input: UpdateWodInput) =>
  adminFetch('/admin/wod', token, { method: 'PUT', body: input })

export const updateChallenge = (token: string, input: UpdateChallengeInput) =>
  adminFetch('/admin/challenge', token, { method: 'PUT', body: input })

export const updatePodium = (token: string, input: UpdatePodiumInput) =>
  adminFetch('/admin/podium', token, { method: 'PUT', body: input })

export const updateSchedule = (token: string, input: UpdateScheduleInput) =>
  adminFetch('/admin/schedule', token, { method: 'PUT', body: input })

export const updatePlan = (token: string, key: string, input: UpdatePlanInput) =>
  adminFetch(`/admin/plans/${encodeURIComponent(key)}`, token, { method: 'PUT', body: input })

export const createProduct = (token: string, input: CreateProductInput) =>
  adminFetch<Product>('/admin/products', token, { method: 'POST', body: input })

export const updateProduct = (token: string, id: string, input: UpdateProductInput) =>
  adminFetch<Product>(`/admin/products/${id}`, token, { method: 'PATCH', body: input })

export const deleteProduct = (token: string, id: string) =>
  adminFetch<void>(`/admin/products/${id}`, token, { method: 'DELETE' })

export const toggleProductStock = (token: string, id: string) =>
  adminFetch<Product>(`/admin/products/${id}/toggle-stock`, token, { method: 'PATCH' })

export const updateOrderStatus = (token: string, id: string, status: string) =>
  adminFetch<Order>(`/admin/orders/${id}/status`, token, { method: 'PATCH', body: { status } })

export const clearLeads = (token: string) =>
  adminFetch<void>('/admin/leads', token, { method: 'DELETE' })

/** Multipart upload (can't go through the JSON apiFetch). */
export async function uploadImage(token: string, formData: FormData): Promise<{ url: string }> {
  const response = await fetch(`${API_URL}/api/admin/uploads`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
    cache: 'no-store',
  })
  if (!response.ok) {
    const data = (await response.json().catch(() => ({}))) as { message?: string }
    throw new ApiError(response.status, data.message ?? 'Upload failed')
  }
  return (await response.json()) as { url: string }
}
