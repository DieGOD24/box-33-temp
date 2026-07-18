import { NextResponse, type NextRequest } from 'next/server'

const API_URL = process.env['API_URL'] ?? 'http://localhost:3001'
const REF_PATTERN = /^[A-Za-z0-9-]{6,80}$/

export async function GET(request: NextRequest) {
  const ref = request.nextUrl.searchParams.get('ref')
  if (!ref || !REF_PATTERN.test(ref)) {
    return NextResponse.json({ message: 'Invalid reference' }, { status: 400 })
  }

  const upstream = await fetch(`${API_URL}/api/payments/${encodeURIComponent(ref)}/status`, {
    cache: 'no-store',
  })
  const data = await upstream.json().catch(() => ({ message: 'Upstream error' }))
  return NextResponse.json(data, { status: upstream.status })
}
