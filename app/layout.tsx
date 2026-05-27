import type { Metadata } from 'next'
import { Tajawal } from 'next/font/google'
import './globals.css'

const tajawal = Tajawal({
  subsets: ['arabic', 'latin'],
  weight: ['400', '500', '700', '800', '900'],
  variable: '--font-body',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'StyleAI — Your Personal Fashion Stylist',
  description: 'Upload any clothing item and get 3 AI-generated outfit suggestions tailored for Egyptian & MENA style.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={tajawal.variable}>
      <body>
        {children}
      </body>
    </html>
  )
}
