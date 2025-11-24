import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Toaster } from 'sonner'
import './globals.css'

export const metadata: Metadata = {
  title: 'Lifeline AI',
  description: 'An emotionally intelligent stabilizer for high-functioning humans.',
  generator: 'Lifeline AI',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        className={`min-h-screen bg-[#F7F4EF] text-slate-900 antialiased ${GeistSans.variable} ${GeistMono.variable}`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  )
}
