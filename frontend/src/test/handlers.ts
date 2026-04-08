import { http, HttpResponse } from 'msw';
import type { TodoEntity } from '../api/generated/types.gen';

export const BASE_URL = 'http://localhost:3000';

let nextId = 1;
let todos: TodoEntity[] = [];

export const resetTodos = (initial: TodoEntity[] = []) => {
  todos = [...initial];
  nextId = todos.length > 0 ? Math.max(...todos.map((t) => t.id)) + 1 : 1;
};

export const handlers = [
  http.get(`${BASE_URL}/todos`, () => {
    return HttpResponse.json(todos);
  }),

  http.post(`${BASE_URL}/todos`, async ({ request }) => {
    const body = await request.json() as { title: string; description?: string };
    const todo: TodoEntity = {
      id: nextId++,
      title: body.title,
      description: body.description,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    todos.push(todo);
    return HttpResponse.json(todo, { status: 201 });
  }),

  http.patch(`${BASE_URL}/todos/:id`, async ({ params, request }) => {
    const id = Number(params['id']);
    const body = await request.json() as Partial<TodoEntity>;
    const index = todos.findIndex((t) => t.id === id);
    if (index === -1) return new HttpResponse(null, { status: 404 });
    todos[index] = { ...todos[index], ...body };
    return HttpResponse.json(todos[index]);
  }),

  http.delete(`${BASE_URL}/todos/:id`, ({ params }) => {
    const id = Number(params['id']);
    const index = todos.findIndex((t) => t.id === id);
    if (index === -1) return new HttpResponse(null, { status: 404 });
    todos.splice(index, 1);
    return new HttpResponse(null, { status: 204 });
  }),
];
