import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockNavigate = vi.fn();
const mockAdminLogin = vi.fn();
const mockSetToken = vi.fn();

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual<typeof import('@tanstack/react-router')>('@tanstack/react-router');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('@/api/generated/sdk.gen', () => ({
  authControllerAdminLogin: (...args: unknown[]) => mockAdminLogin(...args),
}));

vi.mock('@/lib/auth', () => ({
  setToken: (...args: unknown[]) => mockSetToken(...args),
}));

import { Route } from './admin.login';

const AdminLoginPage = Route.options.component as NonNullable<
  typeof Route.options.component
>;

describe('admin login page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockResolvedValue(undefined);
  });

  it('表示時、管理者ログインフォームが表示されること', () => {
    render(<AdminLoginPage />);

    expect(screen.getByRole('heading', { name: '管理者ログイン' })).toBeInTheDocument();
    expect(screen.getByLabelText('メールアドレス')).toBeInTheDocument();
    expect(screen.getByLabelText('パスワード')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'ログイン' })).toBeInTheDocument();
  });

  it('有効な認証情報の時、トークンを保存して/adminへ遷移すること', async () => {
    const user = userEvent.setup();
    mockAdminLogin.mockResolvedValue({
      data: { accessToken: 'admin.jwt.token' },
      error: undefined,
    });

    render(<AdminLoginPage />);

    await user.type(screen.getByLabelText('メールアドレス'), 'admin@example.com');
    await user.type(screen.getByLabelText('パスワード'), 'password123');
    await user.click(screen.getByRole('button', { name: 'ログイン' }));

    await waitFor(() => {
      expect(mockAdminLogin).toHaveBeenCalledWith({
        body: { email: 'admin@example.com', password: 'password123' },
        throwOnError: false,
      });
    });

    expect(mockSetToken).toHaveBeenCalledWith('admin.jwt.token');
    expect(mockNavigate).toHaveBeenCalledWith({ to: '/admin' });
  });

  it('認証に失敗した時、エラーメッセージを表示すること', async () => {
    const user = userEvent.setup();
    mockAdminLogin.mockResolvedValue({ data: undefined, error: { message: 'Unauthorized' } });

    render(<AdminLoginPage />);

    await user.type(screen.getByLabelText('メールアドレス'), 'admin@example.com');
    await user.type(screen.getByLabelText('パスワード'), 'password123');
    await user.click(screen.getByRole('button', { name: 'ログイン' }));

    expect(await screen.findByText('メールアドレスまたはパスワードが正しくありません')).toBeInTheDocument();
    expect(mockSetToken).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});