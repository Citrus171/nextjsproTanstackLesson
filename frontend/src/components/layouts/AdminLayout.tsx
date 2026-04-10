import { useState, type ReactNode } from 'react'

const NAV_ITEMS = [
  { label: 'ダッシュボード', href: '/admin/dashboard' },
  { label: '商品管理', href: '/admin/products' },
  { label: '注文管理', href: '/admin/orders' },
  { label: '会員管理', href: '/admin/members' },
  { label: '管理者アカウント管理', href: '/admin/admins' },
  { label: '店舗設定', href: '/admin/settings' },
]

interface AdminLayoutProps {
  children: ReactNode
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-svh">
      {/* モバイルオーバーレイ */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* サイドバー */}
      <aside
        className={[
          'fixed inset-y-0 left-0 z-30 w-60 flex-col border-r bg-background transition-transform md:static md:flex md:translate-x-0',
          sidebarOpen ? 'flex translate-x-0' : '-translate-x-full',
        ].join(' ')}
      >
        <div className="flex h-14 items-center border-b px-4">
          <span className="font-semibold">管理画面</span>
        </div>
        <nav className="flex flex-col gap-1 p-3">
          {NAV_ITEMS.map(({ label, href }) => (
            <a
              key={href}
              href={href}
              className="rounded-md px-3 py-2 text-sm hover:bg-accent"
            >
              {label}
            </a>
          ))}
        </nav>
      </aside>

      {/* メインエリア */}
      <div className="flex flex-1 flex-col">
        {/* モバイルヘッダー */}
        <header className="flex h-14 items-center border-b px-4 md:hidden">
          <button
            type="button"
            aria-label={sidebarOpen ? 'メニューを閉じる' : 'メニューを開く'}
            onClick={() => setSidebarOpen((prev) => !prev)}
            className="rounded-md p-1.5 hover:bg-accent"
          >
            <span className="sr-only">{sidebarOpen ? 'メニューを閉じる' : 'メニューを開く'}</span>
            {sidebarOpen ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M3 12h18M3 6h18M3 18h18" />
              </svg>
            )}
          </button>
        </header>

        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}
