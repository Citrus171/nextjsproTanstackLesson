import '@testing-library/jest-dom';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll } from 'vitest';
import { client } from '../api/generated/client.gen';
import { handlers, resetTodos } from './handlers';

export const server = setupServer(...handlers);

beforeAll(() => {
  client.setConfig({ baseUrl: 'http://localhost:3000' });
  server.listen({ onUnhandledRequest: 'error' });
});

afterEach(() => {
  server.resetHandlers();
  resetTodos();
});

afterAll(() => {
  server.close();
});
