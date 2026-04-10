import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import { AdminLayout } from './AdminLayout'

describe('AdminLayout', () => {
  const navItems = [
    'ダッシュボード',
    '商品管理',
    '注文管理',
    '会員管理',
    '管理者アカウント管理',
    '店舗設定',
  ]

  it.each(navItems)('サイドバーに「%s」リンクが表示されること', (label) => {
    render(<AdminLayout><div>コンテンツ</div></AdminLayout>)
    expect(screen.getByRole('link', { name: label })).toBeInTheDocument()
  })

  it('childrenが描画されること', () => {
    render(<AdminLayout><div>管理画面コンテンツ</div></AdminLayout>)
    expect(screen.getByText('管理画面コンテンツ')).toBeInTheDocument()
  })

  it('モバイルメニュートグルボタンが存在すること', () => {
    render(<AdminLayout><div>コンテンツ</div></AdminLayout>)
    expect(screen.getByRole('button', { name: /メニューを開く/i })).toBeInTheDocument()
  })

  it('モバイルメニュートグルを押すとサイドバーが開閉すること', async () => {
    const user = userEvent.setup()
    render(<AdminLayout><div>コンテンツ</div></AdminLayout>)
    const toggle = screen.getByRole('button', { name: /メニューを開く/i })
    await user.click(toggle)
    expect(screen.getByRole('button', { name: /メニューを閉じる/i })).toBeInTheDocument()
  })
})
