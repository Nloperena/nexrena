import type { Metadata } from 'next'
import { Playfair_Display, DM_Sans } from 'next/font/google'
import './globals.css'
import { AuthGate } from '@/components/auth-gate'
import { AdminShell } from '@/components/admin-shell'

const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-serif' })
const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-sans' })

export const metadata: Metadata = {
  title: 'Nexrena Portal',
  description: 'Client portal and team operations for Nexrena.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${dmSans.variable}`}>
      <body className="bg-[#111418] text-white min-h-screen">
        <AuthGate>
          <AdminShell>{children}</AdminShell>
        </AuthGate>
      </body>
    </html>
  )
}
