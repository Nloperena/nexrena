import nodemailer from 'nodemailer'
import { escapeHtml } from './sanitize'

const SMTP_HOST = process.env.SMTP_HOST
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587', 10)
const SMTP_USER = process.env.SMTP_USER
const SMTP_PASS = process.env.SMTP_PASS
const NOTIFY_TO = process.env.NOTIFY_EMAIL || 'NicholasL@Nexrena.com'
const NOTIFY_FROM = process.env.NOTIFY_FROM || 'Nexrena Leads <leads@nexrena.com>'
const MESSAGE_NOTIFY_TO = [
  'NicholasLoperena@gmail.com',
  'NicholasL@Nexrena.com',
]
const OPS_URL = (process.env.PORTAL_URL || 'https://nexrena-ops.vercel.app').replace(/\/$/, '')

const isConfigured = SMTP_HOST && SMTP_USER && SMTP_PASS

const transporter = isConfigured
  ? nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    })
  : null

interface LeadData {
  name: string
  email: string
  company?: string | null
  budget?: string | null
  projectType?: string | null
  message: string
}

export async function notifyNewLead(lead: LeadData): Promise<void> {
  if (!transporter) {
    console.log('[notify] SMTP not configured — skipping email notification')
    return
  }

  const subject = `New Lead: ${lead.name}${lead.company ? ` (${lead.company})` : ''}`

  const text = [
    `New website lead submission:`,
    ``,
    `Name: ${lead.name}`,
    lead.company ? `Company: ${lead.company}` : null,
    `Email: ${lead.email}`,
    lead.budget ? `Budget: ${lead.budget}` : null,
    lead.projectType ? `Project Type: ${lead.projectType}` : null,
    ``,
    `Message:`,
    lead.message,
    ``,
    `---`,
    `Respond within 24 hours. View all leads in Nexrena Ops.`,
  ]
    .filter((line): line is string => line !== null)
    .join('\n')

  const html = `
    <div style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #0C0F12; padding: 24px 32px; border-bottom: 2px solid #C9A96E;">
        <h1 style="color: #FDFCFA; font-size: 20px; margin: 0; font-weight: 400;">
          New Lead <span style="color: #C9A96E;">→</span> ${lead.name}
        </h1>
      </div>
      <div style="padding: 24px 32px; background: #141820; color: #A8B5C4;">
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr><td style="padding: 8px 0; color: #7A8A9E; width: 110px;">Name</td><td style="color: #FDFCFA;">${lead.name}</td></tr>
          ${lead.company ? `<tr><td style="padding: 8px 0; color: #7A8A9E;">Company</td><td style="color: #FDFCFA;">${lead.company}</td></tr>` : ''}
          <tr><td style="padding: 8px 0; color: #7A8A9E;">Email</td><td><a href="mailto:${lead.email}" style="color: #C9A96E;">${lead.email}</a></td></tr>
          ${lead.budget ? `<tr><td style="padding: 8px 0; color: #7A8A9E;">Budget</td><td style="color: #C9A96E; font-weight: 600;">${lead.budget}</td></tr>` : ''}
          ${lead.projectType ? `<tr><td style="padding: 8px 0; color: #7A8A9E;">Type</td><td style="color: #FDFCFA;">${lead.projectType}</td></tr>` : ''}
        </table>
        <div style="margin-top: 20px; padding: 16px; background: #1E2530; border-left: 3px solid #C9A96E; border-radius: 4px;">
          <p style="margin: 0; color: #7A8A9E; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 8px;">Message</p>
          <p style="margin: 0; color: #D4DCE6; white-space: pre-wrap; line-height: 1.6;">${lead.message}</p>
        </div>
        <p style="margin-top: 24px; font-size: 12px; color: #3D4A5C;">
          Respond within 24 hours &middot; <a href="mailto:${lead.email}" style="color: #C9A96E;">Reply to ${lead.name}</a>
        </p>
      </div>
    </div>
  `

  try {
    await transporter.sendMail({ from: NOTIFY_FROM, to: NOTIFY_TO, subject, text, html })
    console.log(`[notify] Lead notification sent for ${lead.email}`)
  } catch (err) {
    console.error('[notify] Failed to send lead notification:', err)
  }
}

interface ClientMessageData {
  clientName: string
  clientEmail: string
  companyName?: string | null
  subject: string
  message: string
}

export async function notifyClientMessage(data: ClientMessageData): Promise<void> {
  if (!transporter) {
    console.log('[notify] SMTP not configured — skipping client message notification')
    return
  }

  const subject = `New portal message from ${data.clientName}`
  const safeName = escapeHtml(data.clientName)
  const safeEmail = escapeHtml(data.clientEmail)
  const safeCompany = data.companyName ? escapeHtml(data.companyName) : null
  const safeSubject = escapeHtml(data.subject)
  const safeMessage = escapeHtml(data.message)
  const messagesUrl = `${OPS_URL}/messages`

  const text = [
    `New client portal message:`,
    ``,
    `From: ${data.clientName}`,
    data.companyName ? `Company: ${data.companyName}` : null,
    `Email: ${data.clientEmail}`,
    `Subject: ${data.subject}`,
    ``,
    `Message:`,
    data.message,
    ``,
    `---`,
    `View in Nexrena Ops: ${messagesUrl}`,
  ]
    .filter((line): line is string => line !== null)
    .join('\n')

  const html = `
    <div style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #0C0F12; padding: 24px 32px; border-bottom: 2px solid #C9A96E;">
        <h1 style="color: #FDFCFA; font-size: 20px; margin: 0; font-weight: 400;">
          Portal Message <span style="color: #C9A96E;">→</span> ${safeName}
        </h1>
      </div>
      <div style="padding: 24px 32px; background: #141820; color: #A8B5C4;">
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr><td style="padding: 8px 0; color: #7A8A9E; width: 110px;">From</td><td style="color: #FDFCFA;">${safeName}</td></tr>
          ${safeCompany ? `<tr><td style="padding: 8px 0; color: #7A8A9E;">Company</td><td style="color: #FDFCFA;">${safeCompany}</td></tr>` : ''}
          <tr><td style="padding: 8px 0; color: #7A8A9E;">Email</td><td><a href="mailto:${safeEmail}" style="color: #C9A96E;">${safeEmail}</a></td></tr>
          <tr><td style="padding: 8px 0; color: #7A8A9E;">Subject</td><td style="color: #FDFCFA;">${safeSubject}</td></tr>
        </table>
        <div style="margin-top: 20px; padding: 16px; background: #1E2530; border-left: 3px solid #C9A96E; border-radius: 4px;">
          <p style="margin: 0; color: #7A8A9E; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 8px;">Message</p>
          <p style="margin: 0; color: #D4DCE6; white-space: pre-wrap; line-height: 1.6;">${safeMessage}</p>
        </div>
        <p style="margin-top: 24px; font-size: 12px; color: #3D4A5C;">
          <a href="${messagesUrl}" style="color: #C9A96E;">View all messages in Nexrena Ops</a>
        </p>
      </div>
    </div>
  `

  try {
    await transporter.sendMail({
      from: NOTIFY_FROM,
      to: MESSAGE_NOTIFY_TO.join(', '),
      subject,
      text,
      html,
    })
    console.log(`[notify] Client message notification sent for ${data.clientEmail}`)
  } catch (err) {
    console.error('[notify] Failed to send client message notification:', err)
  }
}

interface AdminReplyData {
  clientName: string
  clientEmail: string
  subject: string
  message: string
}

export async function notifyAdminReply(data: AdminReplyData): Promise<void> {
  if (!transporter) {
    console.log('[notify] SMTP not configured — skipping admin reply notification')
    return
  }

  const portalUrl = (process.env.PORTAL_URL || 'https://nexrena-ops.vercel.app').replace(/\/$/, '')
  const subject = `Reply from Nico: ${data.subject}`
  const safeName = escapeHtml(data.clientName)
  const safeSubject = escapeHtml(data.subject)
  const safeMessage = escapeHtml(data.message)

  const text = [
    `Hi ${data.clientName},`,
    ``,
    `Nico replied to your portal message "${data.subject}":`,
    ``,
    data.message,
    ``,
    `---`,
    `View the conversation: ${portalUrl}`,
  ].join('\n')

  const html = `
    <div style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #0C0F12; padding: 24px 32px; border-bottom: 2px solid #C9A96E;">
        <h1 style="color: #FDFCFA; font-size: 20px; margin: 0; font-weight: 400;">
          Reply from Nico
        </h1>
      </div>
      <div style="padding: 24px 32px; background: #141820; color: #A8B5C4;">
        <p style="margin: 0 0 16px; color: #FDFCFA;">Hi ${safeName},</p>
        <p style="margin: 0 0 8px; color: #7A8A9E; font-size: 12px; text-transform: uppercase;">Re: ${safeSubject}</p>
        <div style="padding: 16px; background: #1E2530; border-left: 3px solid #C9A96E; border-radius: 4px;">
          <p style="margin: 0; color: #D4DCE6; white-space: pre-wrap; line-height: 1.6;">${safeMessage}</p>
        </div>
        <p style="margin-top: 24px; font-size: 12px; color: #3D4A5C;">
          <a href="${portalUrl}" style="color: #C9A96E;">Open your client portal</a>
        </p>
      </div>
    </div>
  `

  try {
    await transporter.sendMail({
      from: NOTIFY_FROM,
      to: data.clientEmail,
      subject,
      text,
      html,
    })
    console.log(`[notify] Admin reply notification sent to ${data.clientEmail}`)
  } catch (err) {
    console.error('[notify] Failed to send admin reply notification:', err)
  }
}
