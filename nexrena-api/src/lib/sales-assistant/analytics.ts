import { prisma } from '../prisma'
import type { ChatAction, ChatIntent, QualificationProfile } from './types'

function hashIp(ip: string): string {
  let h = 0
  for (let i = 0; i < ip.length; i++) h = (Math.imul(31, h) + ip.charCodeAt(i)) | 0
  return `ip_${Math.abs(h)}`
}

export async function logChatTurn(params: {
  sessionId: string
  ip?: string
  pageUrl?: string
  role: 'user' | 'assistant'
  content: string
  intent?: ChatIntent
  retrievedIds?: string[]
  actions?: ChatAction[]
  leadScore?: number
  qualification?: QualificationProfile
  flagged?: boolean
  grounded?: boolean
}): Promise<void> {
  try {
    const ipHash = params.ip ? hashIp(params.ip) : null
    await prisma.chatSession.upsert({
      where: { sessionId: params.sessionId },
      create: {
        sessionId: params.sessionId,
        ipHash,
        pageUrl: params.pageUrl?.slice(0, 500) ?? null,
        leadScore: params.leadScore ?? 0,
        qualification: params.qualification ?? {},
      },
      update: {
        pageUrl: params.pageUrl?.slice(0, 500) ?? undefined,
        leadScore: params.leadScore ?? undefined,
        qualification: params.qualification ?? undefined,
      },
    })

    await prisma.chatTurn.create({
      data: {
        sessionId: params.sessionId,
        role: params.role,
        content: params.content.slice(0, 2000),
        intent: params.intent ?? null,
        retrieved: params.retrievedIds ?? [],
        actions: params.actions ?? [],
        flagged: params.flagged ?? false,
        grounded: params.grounded ?? false,
      },
    })
  } catch (err) {
    console.error('Chat analytics log failed:', err)
  }
}

export async function logKnowledgeGap(sessionId: string, question: string, intent: ChatIntent): Promise<void> {
  try {
    await prisma.chatKnowledgeGap.create({
      data: {
        sessionId,
        question: question.slice(0, 500),
        intent,
      },
    })
  } catch (err) {
    console.error('Knowledge gap log failed:', err)
  }
}
