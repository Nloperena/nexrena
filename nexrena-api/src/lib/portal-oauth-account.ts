import { prisma } from './prisma'
import { notifyNewLead } from './notify'
import { signPortalToken } from './portal-token'
import type { OAuthProfile } from './oauth-providers'
import type { OAuthProvider } from './oauth'

function genContactId() {
  return Math.random().toString(36).slice(2, 10)
}

function nowIso() {
  return new Date().toISOString()
}

function sessionResponse(account: {
  id: string
  email: string
  name: string
  company: string | null
  contactId: string
}) {
  const token = signPortalToken({
    accountId: account.id,
    contactId: account.contactId,
    email: account.email,
  })
  return {
    token,
    account: {
      id: account.id,
      email: account.email,
      name: account.name,
      company: account.company,
      contactId: account.contactId,
    },
  }
}

export async function findOrCreateOAuthPortalAccount(
  provider: OAuthProvider,
  profile: OAuthProfile,
) {
  if (!profile.emailVerified) {
    throw new Error('Your email must be verified with the provider before signing in.')
  }

  const byOAuth = await prisma.portalAccount.findFirst({
    where: { authProvider: provider, oauthSubjectId: profile.subjectId },
  })
  if (byOAuth) return sessionResponse(byOAuth)

  const byEmail = await prisma.portalAccount.findUnique({
    where: { email: profile.email },
  })

  if (byEmail) {
    if (byEmail.oauthSubjectId && byEmail.oauthSubjectId !== profile.subjectId) {
      throw new Error('This email is already linked to a different sign-in provider.')
    }
    const updated = await prisma.portalAccount.update({
      where: { id: byEmail.id },
      data: {
        oauthSubjectId: profile.subjectId,
        authProvider: byEmail.passwordHash ? byEmail.authProvider : provider,
        name: byEmail.name || profile.name,
      },
    })
    return sessionResponse(updated)
  }

  const contactId = genContactId()
  const ts = nowIso()

  await prisma.contact.create({
    data: {
      id: contactId,
      name: profile.name,
      company: profile.name,
      email: profile.email,
      industry: 'other',
      stage: 'portal',
      value: 0,
      notes: `Client portal signup via ${provider}.`,
      createdAt: ts,
      updatedAt: ts,
    },
  })

  const account = await prisma.portalAccount.create({
    data: {
      email: profile.email,
      name: profile.name,
      company: null,
      contactId,
      authProvider: provider,
      oauthSubjectId: profile.subjectId,
      passwordHash: null,
    },
  })

  const lead = await prisma.lead.create({
    data: {
      name: profile.name,
      email: profile.email,
      message: `Client signed up via ${provider}.`,
      source: 'portal-signup',
      projectType: 'portal',
      status: 'new',
    },
  })

  notifyNewLead({
    name: profile.name,
    email: profile.email,
    message: lead.message,
    projectType: 'portal',
  }).catch(() => {})

  return sessionResponse(account)
}
