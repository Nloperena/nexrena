import type { Metadata } from 'next'
import { Playfair_Display, DM_Sans } from 'next/font/google'
import './globals.css'
import { Sidebar } from '@/components/ui'
import { FakeAuthGate } from '@/components/fake-auth-gate'

const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-serif' })
const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-sans' })

export const metadata: Metadata = {
  title: 'Nexrena Ops',
  description: 'Nexrena Internal Operations Platform',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${dmSans.variable}`}>
      <body className="bg-[#111418] text-white min-h-screen">
        <FakeAuthGate>
          <Sidebar />
          <main className="ml-56 min-h-screen relative z-10">
            <div className="max-w-6xl mx-auto px-10 py-10">
              {children}
            </div>
          </main>
        </FakeAuthGate>
      </body>
    </html>
  )
}
