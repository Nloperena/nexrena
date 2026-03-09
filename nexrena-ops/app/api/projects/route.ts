import { NextRequest, NextResponse } from 'next/server'
import { readData, writeData } from '@/lib/json-store'
import { Project } from '@/lib/types'

export function GET() {
  return NextResponse.json(readData<Project>('projects.json'))
}

export async function POST(req: NextRequest) {
  const data = await req.json()
  writeData<Project>('projects.json', data)
  return NextResponse.json({ ok: true })
}
