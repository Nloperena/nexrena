import { NextRequest } from 'next/server'

export const runtime = 'edge'

const UPSTREAM = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '')

export async function POST(req: NextRequest) {
  if (!UPSTREAM) {
    return new Response('Portal copilot proxy not configured', { status: 503 })
  }

  const auth = req.headers.get('authorization')
  if (!auth) {
    return new Response('Unauthorized', { status: 401 })
  }

  const body = await req.json()

  const upstreamResponse = await fetch(`${UPSTREAM}/api/portal/ai/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: auth,
    },
    body: JSON.stringify({
      messages: body.messages,
      currentPath: body.currentPath,
      id: body.id,
      trigger: body.trigger,
      messageId: body.messageId,
    }),
  })

  if (!upstreamResponse.ok || !upstreamResponse.body) {
    const text = await upstreamResponse.text().catch(() => 'Upstream connection failure')
    return new Response(text, { status: upstreamResponse.status || 502 })
  }

  return new Response(upstreamResponse.body, {
    status: upstreamResponse.status,
    headers: {
      'Content-Type': upstreamResponse.headers.get('Content-Type') ?? 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache',
    },
  })
}
