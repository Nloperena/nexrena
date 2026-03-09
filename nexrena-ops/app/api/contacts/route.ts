import { NextRequest, NextResponse } from 'next/server'
import { readData, writeData } from '@/lib/json-store'
import { Contact } from '@/lib/types'

export function GET() {
  return NextResponse.json(readData<Contact>('contacts.json'))
}

export async function POST(req: NextRequest) {
  const data = await req.json()
  writeData<Contact>('contacts.json', data)
  return NextResponse.json({ ok: true })
}
