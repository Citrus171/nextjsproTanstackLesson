import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  todosControllerFindAllOptions,
  todosControllerFindAllQueryKey,
  todosControllerRemoveMutation,
  todosControllerUpdateMutation,
} from '../api/generated/@tanstack/react-query.gen';
import type { TodoEntity } from '../api/generated/types.gen';

export function TodoList() {
  const queryClient = useQueryClient();

  // 生成された queryOptions をそのまま useQuery に渡す
  const { data: todos, isLoading, isError } = useQuery(todosControllerFindAllOptions());

  const { mutate: removeTodo } = useMutation({
    ...todosControllerRemoveMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: todosControllerFindAllQueryKey() });
    },
  });

  const { mutate: toggleTodo } = useMutation({
    ...todosControllerUpdateMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: todosControllerFindAllQueryKey() });
    },
  });

  if (isLoading) return <p>読み込み中...</p>;
  if (isError) return <p style={{ color: 'red' }}>エラーが発生しました。バックエンドが起動しているか確認してください。</p>;

  return (
    <div>
      <h2>Todo一覧 ({todos?.length ?? 0}件)</h2>
      {todos?.length === 0 && <p>Todoがありません</p>}
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {todos?.map((todo: TodoEntity) => (
          <li
            key={todo.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.5rem 0',
              borderBottom: '1px solid #eee',
            }}
          >
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() =>
                toggleTodo({ path: { id: todo.id }, body: { completed: !todo.completed } })
              }
            />
            <span style={{ textDecoration: todo.completed ? 'line-through' : 'none', flex: 1 }}>
              <strong>{todo.title}</strong>
              {todo.description && (
                <span style={{ color: '#666', marginLeft: '0.5rem' }}>— {todo.description}</span>
              )}
            </span>
            <button
              onClick={() => removeTodo({ path: { id: todo.id } })}
              style={{ color: 'red', background: 'none', border: '1px solid red', cursor: 'pointer', padding: '2px 8px' }}
            >
              削除
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
