import type { Metadata, Viewport } from 'next'
import { Playfair_Display, DM_Sans } from 'next/font/google'
import './globals.css'
import { AuthGate } from '@/components/auth-gate'
import { AdminShell } from '@/components/admin-shell'
import { PwaRegister } from '@/components/pwa-register'
import { PwaInstallCapture } from '@/components/pwa-install-prompt'

const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-serif' })
const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-sans' })

export const metadata: Metadata = {
  title: 'Nexrena',
  description: 'Client portal and team operations for Nexrena.',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Nexrena',
  },
  icons: {
    icon: '/icons/icon.svg',
    apple: '/icons/icon.svg',
  },
}

export const viewport: Viewport = {
  themeColor: '#C9A96E',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${dmSans.variable}`}>
      <body className="bg-[#111418] text-white min-h-screen">
        <PwaRegister />
        <PwaInstallCapture />
        <AuthGate>
          <AdminShell>{children}</AdminShell>
        </AuthGate>
      </body>
    </html>
  )
}
