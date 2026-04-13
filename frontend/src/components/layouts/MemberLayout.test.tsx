import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemberLayout } from './MemberLayout'

vi.mock('@/lib/auth', () => ({
  isAuthenticated: vi.fn(),
}))

import * as auth from '@/lib/auth'

describe('MemberLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('未認証の場合', () => {
    beforeEach(() => {
      vi.mocked(auth.isAuthenticated).mockReturnValue(false)
    })

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

    it('マイページリンクが表示されないこと', () => {
      render(<MemberLayout><div>コンテンツ</div></MemberLayout>)
      expect(screen.queryByRole('link', { name: 'マイページ' })).not.toBeInTheDocument()
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

  describe('認証済みの場合', () => {
    beforeEach(() => {
      vi.mocked(auth.isAuthenticated).mockReturnValue(true)
    })

    it('マイページリンクが表示されること', () => {
      render(<MemberLayout><div>コンテンツ</div></MemberLayout>)
      expect(screen.getByRole('link', { name: 'マイページ' })).toBeInTheDocument()
    })

    it('マイページリンクのhrefが /my-page であること', () => {
      render(<MemberLayout><div>コンテンツ</div></MemberLayout>)
      expect(screen.getByRole('link', { name: 'マイページ' })).toHaveAttribute('href', '/my-page')
    })

    it('ログインリンクが表示されないこと', () => {
      render(<MemberLayout><div>コンテンツ</div></MemberLayout>)
      expect(screen.queryByRole('link', { name: 'ログイン' })).not.toBeInTheDocument()
    })
  })
})
