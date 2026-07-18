import { NextResponse, type NextRequest } from 'next/server'

const API_URL = process.env['API_URL'] ?? 'http://localhost:3001'

/** Server-side proxy: keeps API_URL internal and avoids CORS from the browser. */
export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ message: 'Invalid JSON' }, { status: 400 })
  }

  const upstream = await fetch(`${API_URL}/api/payments/checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    cache: 'no-store',
  })

  const data = await upstream.json().catch(() => ({ message: 'Upstream error' }))
  return NextResponse.json(data, { status: upstream.status })
}
