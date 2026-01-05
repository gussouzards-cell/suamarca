import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Rádio Indoor - Painel Administrativo',
  description: 'Gerenciamento de TV Boxes para Rádio Indoor',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}







