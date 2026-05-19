import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'Integrative Platform - Medicina Integrativa',
    template: '%s | Integrative Platform',
  },
  description: 'Plataforma de Medicina Integrativa - Cuidado completo para corpo, mente e espírito.',
  keywords: ['medicina integrativa', 'saúde', 'bem-estar', 'tratamento'],
  authors: [{ name: 'Integrative Platform' }],
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    siteName: 'Integrative Platform',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <head>
        {process.env.GOOGLE_ADSENSE_ID && process.env.GOOGLE_ADSENSE_ID !== 'ca-pub-XXXXXXXXXXXXXXXX' && (
          <>
            <script async src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.GOOGLE_ADSENSE_ID}`} crossOrigin="anonymous" />
            <meta name="google-adsense-account" content={process.env.GOOGLE_ADSENSE_ID} />
          </>
        )}
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}
