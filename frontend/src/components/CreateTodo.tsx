import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { todosControllerCreateMutation, todosControllerFindAllQueryKey } from '../api/generated/@tanstack/react-query.gen';

export function CreateTodo() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const queryClient = useQueryClient();

  // 生成された mutation オプションをそのまま useMutation に渡す
  const { mutate, isPending } = useMutation({
    ...todosControllerCreateMutation(),
    onSuccess: () => {
      // 作成後にTodo一覧のキャッシュを無効化 → 自動的に再フェッチ
      queryClient.invalidateQueries({ queryKey: todosControllerFindAllQueryKey() });
      setTitle('');
      setDescription('');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    mutate({ body: { title, description: description || undefined } });
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: '1.5rem' }}>
      <h2>新しいTodoを追加</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxWidth: 400 }}>
        <input
          type="text"
          placeholder="タイトル（必須）"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="詳細（任意）"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <button type="submit" disabled={isPending}>
          {isPending ? '追加中...' : '追加'}
        </button>
      </div>
    </form>
  );
}
