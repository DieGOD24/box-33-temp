import { revalidateTag } from 'next/cache'
import { NextResponse, type NextRequest } from 'next/server'

const KNOWN_TAGS = ['content', 'products'] as const

/**
 * On-demand ISR hook, called by the API after dashboard mutations so public
 * pages refresh immediately instead of waiting out the 60s window.
 */
export async function POST(request: NextRequest) {
  const secret = process.env['REVALIDATION_SECRET']
  let body: { secret?: string; tags?: string[] }
  try {
    body = (await request.json()) as typeof body
  } catch {
    return NextResponse.json({ message: 'Invalid JSON' }, { status: 400 })
  }

  // Fail closed: an unset secret must never mean "open".
  if (!secret || body.secret !== secret) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const tags = (body.tags ?? []).filter((t): t is (typeof KNOWN_TAGS)[number] =>
    (KNOWN_TAGS as readonly string[]).includes(t)
  )
  // Next 16: the 'max' profile reproduces the classic expire-now semantics.
  for (const tag of tags) revalidateTag(tag, 'max')
  return NextResponse.json({ revalidated: true, tags })
}
