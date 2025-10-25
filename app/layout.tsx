import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import ClientNavigation from '@/components/ClientNavigation'
// import SpeedInsightsComponent from '@/components/SpeedInsights'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'OperaFlow',
  description: 'Système de gestion opérationnelle',
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <ClientNavigation />
        {children}
        {/* <SpeedInsightsComponent /> */}
      </body>
    </html>
  )
}