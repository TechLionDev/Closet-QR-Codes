import './globals.css'
import { Quicksand } from 'next/font/google'

const inter = Quicksand({ subsets: ['latin'] })

export const metadata = {
  title: 'Servant\'s Room Closet QR Codes',
  description: 'Created By TechLion Dev',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}
