import { CreateTodo } from './components/CreateTodo';
import { TodoList } from './components/TodoList';

export default function App() {
  return (
    <div style={{ maxWidth: 600, margin: '2rem auto', fontFamily: 'sans-serif', padding: '0 1rem' }}>
      <h1>NestJS + TanStack Query デモ</h1>
      <p style={{ color: '#666', fontSize: '0.875rem' }}>
        API: NestJS → Swagger → openapi-ts codegen → TanStack Query
      </p>
      <hr />
      <CreateTodo />
      <TodoList />
    </div>
  );
}
