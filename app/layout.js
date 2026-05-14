import './globals.css'

export const metadata = {
  title: 'Campagna',
  description: 'Archivio campagna D&D',
}

export default function RootLayout({ children }) {
  return (
    <html lang="it">
      <body>{children}</body>
    </html>
  )
}
