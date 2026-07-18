import { NextResponse } from 'next/server'

/** Container HEALTHCHECK — must answer without any upstream API call. */
export function GET() {
  return NextResponse.json({ status: 'ok' }, { status: 200 })
}
