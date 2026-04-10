import { Toaster } from 'sonner'
import type { ReactNode } from 'react'

interface RootLayoutProps {
  children: ReactNode
}

export function RootLayout({ children }: RootLayoutProps) {
  return (
    <>
      {children}
      <Toaster position="top-right" richColors />
    </>
  )
}
