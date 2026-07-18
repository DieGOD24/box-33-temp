const API_URL = process.env['API_URL'] ?? 'http://localhost:3001'

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly code?: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

interface ApiFetchOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown
  token?: string
  revalidate?: number
  tags?: string[]
  cache?: RequestCache
}

/**
 * Server-side API client — only callable from Server Components, server
 * actions and route handlers (API_URL is internal and never reaches the
 * browser). Throws ApiError on non-2xx.
 */
export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { method = 'GET', body, token, revalidate, tags, cache } = options

  const response = await fetch(`${API_URL}/api${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    ...(cache ? { cache } : {}),
    ...(revalidate !== undefined || tags ? { next: { revalidate, tags } } : {}),
  })

  if (!response.ok) {
    let message = `API error ${response.status}`
    let code: string | undefined
    try {
      const data = (await response.json()) as { message?: string | string[]; code?: string }
      message = Array.isArray(data.message) ? data.message.join(', ') : (data.message ?? message)
      code = data.code
    } catch {
      /* non-JSON error body */
    }
    throw new ApiError(response.status, message, code)
  }

  if (response.status === 204) return undefined as T
  return (await response.json()) as T
}
