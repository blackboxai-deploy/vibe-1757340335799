import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: "Jam's 23rd Birthday Adventure",
  description: 'A retro cute birthday game for Jam - collect treats and celebrate!',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gradient-to-br from-pink-100 via-purple-50 to-blue-100 min-h-screen`}>
        <div className="container mx-auto px-4 py-8">
          <header className="text-center mb-8">
            <h1 className="text-6xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent mb-2">
              🎮 JAM'S BIRTHDAY ADVENTURE 🎂
            </h1>
            <p className="text-xl text-gray-700 font-medium">
              Happy 23rd Birthday! 🎉 Collect treats and celebrate in retro style!
            </p>
          </header>
          {children}
        </div>
      </body>
    </html>
  )
}