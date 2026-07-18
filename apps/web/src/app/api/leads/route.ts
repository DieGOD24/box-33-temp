import { NextResponse, type NextRequest } from 'next/server'

const API_URL = process.env['API_URL'] ?? 'http://localhost:3001'

/**
 * Public lead capture (pre-registration form). Intentionally unauthenticated —
 * a server-side proxy that keeps API_URL internal and avoids CORS from the
 * browser. Abuse protection belongs at the API/edge (rate limiting), not here.
 */
export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ message: 'Invalid JSON' }, { status: 400 })
  }

  const upstream = await fetch(`${API_URL}/api/leads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    cache: 'no-store',
  })

  if (upstream.status === 204) return new NextResponse(null, { status: 204 })
  const data = await upstream.json().catch(() => ({ message: 'Upstream error' }))
  return NextResponse.json(data, { status: upstream.status })
}
