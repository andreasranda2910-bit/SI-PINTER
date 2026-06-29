import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SI PINTER — Sistem Penyimpanan Dokumen Irban V',
  description: 'Sistem Penyimpanan Dokumen Perencanaan dan Penganggaran Irban V Inspektorat Kabupaten Sumba Barat',
  icons: { icon: '/favicon.ico' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="bg-gray-50 text-gray-900 antialiased">{children}</body>
    </html>
  )
}
