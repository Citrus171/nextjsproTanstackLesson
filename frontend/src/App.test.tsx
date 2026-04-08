import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from './App';
import { renderWithClient } from './test/utils';

describe('App', () => {
  it('メインタイトルを表示する', () => {
    renderWithClient(<App />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'NestJS + TanStack Query デモ',
    );
  });

  it('CreateTodo フォームを含む', () => {
    renderWithClient(<App />);
    expect(screen.getByPlaceholderText('タイトル（必須）')).toBeInTheDocument();
  });

  it('TodoList セクションを含む', () => {
    renderWithClient(<App />);
    expect(
      screen.getByRole('heading', { name: /新しいTodoを追加/ }),
    ).toBeInTheDocument();
  });
});
