import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { MemberLayout } from './MemberLayout'

describe('MemberLayout', () => {
  it('ロゴが表示されること', () => {
    render(<MemberLayout><div>コンテンツ</div></MemberLayout>)
    expect(screen.getByRole('link', { name: /ECサイト/i })).toBeInTheDocument()
  })

  it('商品一覧リンクが表示されること', () => {
    render(<MemberLayout><div>コンテンツ</div></MemberLayout>)
    expect(screen.getByRole('link', { name: '商品一覧' })).toBeInTheDocument()
  })

  it('カートリンクが表示されること', () => {
    render(<MemberLayout><div>コンテンツ</div></MemberLayout>)
    expect(screen.getByRole('link', { name: 'カート' })).toBeInTheDocument()
  })

  it('ログインリンクが表示されること', () => {
    render(<MemberLayout><div>コンテンツ</div></MemberLayout>)
    expect(screen.getByRole('link', { name: 'ログイン' })).toBeInTheDocument()
  })

  it('フッターにコピーライトが表示されること', () => {
    render(<MemberLayout><div>コンテンツ</div></MemberLayout>)
    expect(screen.getByRole('contentinfo')).toHaveTextContent('© 2026 ECサイト')
  })

  it('childrenが描画されること', () => {
    render(<MemberLayout><div>メインコンテンツ</div></MemberLayout>)
    expect(screen.getByText('メインコンテンツ')).toBeInTheDocument()
  })
})
