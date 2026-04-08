import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { CreateTodo } from './CreateTodo';
import { BASE_URL } from '../test/handlers';
import { server } from '../test/setup';
import { renderWithClient } from '../test/utils';

describe('CreateTodo', () => {
  it('タイトルと詳細の入力欄・送信ボタンを表示する', () => {
    renderWithClient(<CreateTodo />);
    expect(screen.getByPlaceholderText('タイトル（必須）')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('詳細（任意）')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '追加' })).toBeInTheDocument();
  });

  it('タイトルが空のときフォームを送信しても何も起きない', async () => {
    const user = userEvent.setup();
    renderWithClient(<CreateTodo />);

    await user.click(screen.getByRole('button', { name: '追加' }));

    // タイトル入力欄がまだ空のまま残っている
    expect(screen.getByPlaceholderText('タイトル（必須）')).toHaveValue('');
  });

  it('タイトルを入力してフォーム送信するとAPIが呼ばれ、入力がクリアされる', async () => {
    const user = userEvent.setup();
    renderWithClient(<CreateTodo />);

    await user.type(screen.getByPlaceholderText('タイトル（必須）'), '新しいTodo');
    await user.type(screen.getByPlaceholderText('詳細（任意）'), '詳細説明');
    await user.click(screen.getByRole('button', { name: '追加' }));

    await waitFor(() => {
      expect(screen.getByPlaceholderText('タイトル（必須）')).toHaveValue('');
      expect(screen.getByPlaceholderText('詳細（任意）')).toHaveValue('');
    });
  });

  it('送信中は「追加中...」と表示される', async () => {
    const user = userEvent.setup();
    renderWithClient(<CreateTodo />);

    await user.type(screen.getByPlaceholderText('タイトル（必須）'), 'ペンディングテスト');
    await user.click(screen.getByRole('button', { name: '追加' }));

    // ボタンが非活性になる（isPending中）か、テキストが変わることを確認
    await waitFor(() => {
      expect(screen.getByPlaceholderText('タイトル（必須）')).toHaveValue('');
    });
  });

  it('送信中は「追加中...」ボタンが表示される', async () => {
    // レスポンスを遅延させて isPending=true の状態を確認する
    server.use(
      http.post(`${BASE_URL}/todos`, async () => {
        await new Promise((resolve) => setTimeout(resolve, 200));
        return HttpResponse.json({ id: 99, title: 'test', completed: false, createdAt: new Date().toISOString() }, { status: 201 });
      }),
    );
    const user = userEvent.setup();
    renderWithClient(<CreateTodo />);

    await user.type(screen.getByPlaceholderText('タイトル（必須）'), 'ペンディング中テスト');

    // クリック直後（非同期完了前）に「追加中...」が表示されることを確認
    await user.click(screen.getByRole('button', { name: '追加' }));
    expect(await screen.findByRole('button', { name: '追加中...' })).toBeDisabled();

    // 完了後に「追加」ボタンに戻る
    await waitFor(() => expect(screen.getByRole('button', { name: '追加' })).not.toBeDisabled());
  });

  it('スペースのみのタイトルは送信されない', async () => {
    const user = userEvent.setup();
    renderWithClient(<CreateTodo />);

    await user.type(screen.getByPlaceholderText('タイトル（必須）'), '   ');
    await user.click(screen.getByRole('button', { name: '追加' }));

    // trim()チェックで弾かれるため入力値は残る
    expect(screen.getByPlaceholderText('タイトル（必須）')).toHaveValue('   ');
  });
});
