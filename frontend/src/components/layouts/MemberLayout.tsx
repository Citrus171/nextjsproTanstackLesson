import type { ReactNode } from 'react'

interface MemberLayoutProps {
  children: ReactNode
}

export function MemberLayout({ children }: MemberLayoutProps) {
  return (
    <div className="flex min-h-svh flex-col">
      <header className="border-b bg-background">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 md:px-6">
          <a href="/" className="text-lg font-semibold tracking-tight">
            ECサイト
          </a>
          <nav className="flex items-center gap-4 md:gap-6">
            <a href="/products" className="text-sm hover:underline">
              商品一覧
            </a>
            <a href="/cart" className="text-sm hover:underline">
              カート
            </a>
            <a href="/login" className="text-sm hover:underline">
              ログイン
            </a>
          </nav>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer role="contentinfo" className="border-t py-6 text-center text-sm text-muted-foreground">
        © 2026 ECサイト
      </footer>
    </div>
  )
}
