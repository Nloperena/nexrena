import { NextRequest, NextResponse } from 'next/server'

const UPSTREAM = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '')
const API_KEY = process.env.API_KEY || process.env.NEXT_PUBLIC_API_KEY || ''

export async function POST(req: NextRequest) {
  if (!UPSTREAM || !API_KEY) {
    return NextResponse.json({ error: 'Copilot proxy not configured' }, { status: 503 })
  }

  const body = await req.json()

  const upstreamResponse = await fetch(`${UPSTREAM}/api/ops/ai/confirm`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      token: body.token,
      currentPath: body.currentPath,
    }),
  })

  const data = await upstreamResponse.json().catch(() => ({ error: 'Invalid upstream response' }))
  return NextResponse.json(data, { status: upstreamResponse.status })
}
