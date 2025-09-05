import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/lib/auth-context'
import { AppLayout } from '@/components/layout/AppLayout'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SplashEasy V2 - AI-Powered Water Testing',
  description:
    'Next-generation AI water testing for pools and spas with multi-brand recognition, weather integration, and trend analysis.',
  keywords: 'pool testing, spa testing, water analysis, AI, GPT-4 vision, chemical testing',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <AppLayout>{children}</AppLayout>
        </AuthProvider>
      </body>
    </html>
  )
}
