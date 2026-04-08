import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import type { TodoEntity } from '../api/generated/types.gen';
import { BASE_URL, resetTodos } from '../test/handlers';
import { server } from '../test/setup';
import { renderWithClient } from '../test/utils';
import { TodoList } from './TodoList';

const makeTodo = (overrides: Partial<TodoEntity> = {}): TodoEntity => ({
  id: 1,
  title: 'テストTodo',
  description: '詳細',
  completed: false,
  createdAt: new Date().toISOString(),
  ...overrides,
});

describe('TodoList', () => {
  it('初期状態で読み込み中を表示する', () => {
    renderWithClient(<TodoList />);
    expect(screen.getByText('読み込み中...')).toBeInTheDocument();
  });

  it('APIエラー時にエラーメッセージを表示する', async () => {
    server.use(
      http.get(`${BASE_URL}/todos`, () => new HttpResponse(null, { status: 500 })),
    );
    renderWithClient(<TodoList />);

    await waitFor(() => {
      expect(screen.getByText(/エラーが発生しました/)).toBeInTheDocument();
    });
  });

  it('Todoが0件のとき「Todoがありません」を表示する', async () => {
    resetTodos([]);
    renderWithClient(<TodoList />);

    await waitFor(() => {
      expect(screen.getByText('Todoがありません')).toBeInTheDocument();
    });
  });

  it('Todoリストを表示する', async () => {
    resetTodos([
      makeTodo({ id: 1, title: 'Todo A' }),
      makeTodo({ id: 2, title: 'Todo B', description: '説明B' }),
    ]);
    renderWithClient(<TodoList />);

    await waitFor(() => {
      expect(screen.getByText('Todo A')).toBeInTheDocument();
      expect(screen.getByText('Todo B')).toBeInTheDocument();
      expect(screen.getByText('— 説明B')).toBeInTheDocument();
    });
  });

  it('件数を正しく表示する', async () => {
    resetTodos([makeTodo({ id: 1 }), makeTodo({ id: 2 })]);
    renderWithClient(<TodoList />);

    await waitFor(() => {
      expect(screen.getByText(/Todo一覧 \(2件\)/)).toBeInTheDocument();
    });
  });

  it('完了済みTodoはタイトルに取り消し線が付く', async () => {
    resetTodos([makeTodo({ id: 1, title: '完了Todo', completed: true })]);
    renderWithClient(<TodoList />);

    await waitFor(() => {
      const title = screen.getByText('完了Todo');
      expect(title.parentElement).toHaveStyle('text-decoration: line-through');
    });
  });

  it('チェックボックスで完了状態をトグルできる', async () => {
    const user = userEvent.setup();
    resetTodos([makeTodo({ id: 1, title: 'トグルTodo', completed: false })]);
    renderWithClient(<TodoList />);

    await waitFor(() => screen.getByText('トグルTodo'));

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked();
    await user.click(checkbox);

    await waitFor(() => {
      expect(screen.getByRole('checkbox')).toBeChecked();
    });
  });

  it('削除ボタンクリックでTodoが消える', async () => {
    const user = userEvent.setup();
    resetTodos([
      makeTodo({ id: 1, title: '削除対象Todo' }),
      makeTodo({ id: 2, title: '残るTodo' }),
    ]);
    renderWithClient(<TodoList />);

    await waitFor(() => screen.getByText('削除対象Todo'));

    const items = screen.getAllByRole('listitem');
    const targetItem = items.find((item) => within(item).queryByText('削除対象Todo'));
    const deleteBtn = within(targetItem!).getByRole('button', { name: '削除' });
    await user.click(deleteBtn);

    await waitFor(() => {
      expect(screen.queryByText('削除対象Todo')).not.toBeInTheDocument();
      expect(screen.getByText('残るTodo')).toBeInTheDocument();
    });
  });
});
