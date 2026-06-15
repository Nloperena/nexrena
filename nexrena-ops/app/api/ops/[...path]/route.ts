import { NextRequest, NextResponse } from 'next/server'

const UPSTREAM = (
  process.env.NEXT_PUBLIC_API_URL || 'https://nexrena-api-5dc54effaa9f.herokuapp.com'
).replace(/\/$/, '')

const API_KEY = process.env.API_KEY || process.env.NEXT_PUBLIC_API_KEY || ''

type RouteContext = { params: Promise<{ path: string[] }> }

async function proxy(req: NextRequest, context: RouteContext) {
  if (!API_KEY) {
    return NextResponse.json(
      { error: 'API_KEY is not configured on the ops server. Set API_KEY or NEXT_PUBLIC_API_KEY in Vercel.' },
      { status: 503 },
    )
  }

  const { path } = await context.params
  const subpath = path.join('/')
  const url = new URL(req.url)
  const target = `${UPSTREAM}/api/${subpath}${url.search}`

  const contentType = req.headers.get('content-type')
  const headers: HeadersInit = {
    Authorization: `Bearer ${API_KEY}`,
  }
  if (contentType) {
    headers['Content-Type'] = contentType
  }

  const hasBody = !['GET', 'HEAD'].includes(req.method)
  const upstream = await fetch(target, {
    method: req.method,
    headers,
    body: hasBody ? await req.arrayBuffer() : undefined,
    cache: 'no-store',
  })

  const responseHeaders = new Headers()
  const passThrough = ['content-type', 'cache-control', 'connection']
  for (const name of passThrough) {
    const value = upstream.headers.get(name)
    if (value) responseHeaders.set(name, value)
  }

  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers: responseHeaders,
  })
}

export const GET = proxy
export const POST = proxy
export const PUT = proxy
export const PATCH = proxy
export const DELETE = proxy
