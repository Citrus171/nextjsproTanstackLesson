import { render, screen, act } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { toast } from 'sonner'
import { RootLayout } from './RootLayout'

describe('RootLayout（Toast統合）', () => {
  it('childrenが描画されること', () => {
    render(<RootLayout><div>ページコンテンツ</div></RootLayout>)
    expect(screen.getByText('ページコンテンツ')).toBeInTheDocument()
  })

  it('toast()を呼ぶとトースト通知が表示されること', async () => {
    render(<RootLayout><div>ページ</div></RootLayout>)
    act(() => {
      toast('テスト通知メッセージ')
    })
    expect(await screen.findByText('テスト通知メッセージ')).toBeInTheDocument()
  })
})
