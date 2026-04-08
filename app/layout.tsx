import type { Metadata } from 'next'
import { Inter, Noto_Serif_Display } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const notoSerifDisplay = Noto_Serif_Display({
  subsets: ['latin'],
  variable: '--font-noto',
  display: 'swap',
  weight: ['400', '700', '800'],
})

export const metadata: Metadata = {
  title: 'Finarbo — Tu cartera, explicada en palabras',
  description: 'Análisis de carteras de inversión para el inversor argentino.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={`${inter.variable} ${notoSerifDisplay.variable}`}>
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
