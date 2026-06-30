import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

const UPSTREAM = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '')

type RouteContext = { params: Promise<{ threadId: string }> }

async function forward(req: NextRequest, threadId: string) {
  if (!UPSTREAM) {
    return NextResponse.json({ error: 'Portal copilot proxy not configured' }, { status: 503 })
  }

  const auth = req.headers.get('authorization')
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const hasBody = !['GET', 'HEAD', 'DELETE'].includes(req.method)
  const upstream = await fetch(`${UPSTREAM}/api/portal/ai/threads/${threadId}`, {
    method: req.method,
    headers: {
      Authorization: auth,
      ...(hasBody ? { 'Content-Type': 'application/json' } : {}),
    },
    body: hasBody ? await req.text() : undefined,
    cache: 'no-store',
  })

  const data = await upstream.text()
  return new NextResponse(data, {
    status: upstream.status,
    headers: {
      'Content-Type': upstream.headers.get('Content-Type') ?? 'application/json',
    },
  })
}

export async function GET(req: NextRequest, context: RouteContext) {
  const { threadId } = await context.params
  return forward(req, threadId)
}

export async function PUT(req: NextRequest, context: RouteContext) {
  const { threadId } = await context.params
  return forward(req, threadId)
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  const { threadId } = await context.params
  return forward(req, threadId)
}
