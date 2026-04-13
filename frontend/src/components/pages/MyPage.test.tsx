import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";

const mockNavigate = vi.fn();
const mockGetMe = vi.fn();
const mockGetOrders = vi.fn();
const mockUpdateProfile = vi.fn();
const mockWithdraw = vi.fn();
const mockGetToken = vi.fn(() => "test-token");
const mockRemoveToken = vi.fn();

vi.mock("@tanstack/react-router", async () => {
  const actual = await vi.importActual<typeof import("@tanstack/react-router")>(
    "@tanstack/react-router",
  );
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("@/api/generated/sdk.gen", () => ({
  usersControllerGetMe: (...args: unknown[]) => mockGetMe(...args),
  usersControllerGetOrders: (...args: unknown[]) => mockGetOrders(...args),
  usersControllerUpdateProfile: (...args: unknown[]) => mockUpdateProfile(...args),
  usersControllerWithdraw: (...args: unknown[]) => mockWithdraw(...args),
}));

vi.mock("@/lib/auth", () => ({
  getToken: () => mockGetToken(),
  removeToken: () => mockRemoveToken(),
}));

// base-ui DialogをReact contextベースで正しくシミュレートするモック
vi.mock("@/components/ui/dialog", async () => {
  const { createContext, useContext, cloneElement } = await import("react");

  type DialogCtx = { open: boolean; onOpenChange?: (v: boolean) => void };
  const DialogCtx = createContext<DialogCtx>({ open: false });

  return {
    Dialog: ({
      children,
      open = false,
      onOpenChange,
    }: {
      children: React.ReactNode;
      open?: boolean;
      onOpenChange?: (v: boolean) => void;
    }) => (
      <DialogCtx.Provider value={{ open, onOpenChange }}>
        {children}
      </DialogCtx.Provider>
    ),
    DialogTrigger: ({ render: renderProp }: { render: React.ReactElement }) => {
      const { onOpenChange } = useContext(DialogCtx);
      return cloneElement(renderProp as React.ReactElement<{ onClick?: () => void }>, {
        onClick: () => onOpenChange?.(true),
      });
    },
    DialogContent: ({ children }: { children: React.ReactNode }) => {
      const { open } = useContext(DialogCtx);
      return open ? <div data-testid="dialog-content">{children}</div> : null;
    },
    DialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    DialogTitle: ({ children }: { children: React.ReactNode }) => (
      <h2 data-testid="dialog-title">{children}</h2>
    ),
    DialogDescription: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
    DialogFooter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  };
});

import { MyPage } from "./MyPage";

const mockProfile = {
  id: 1,
  name: "山田太郎",
  email: "test@example.com",
  address: "東京都渋谷区",
  createdAt: "2024-01-01T00:00:00.000Z",
  deletedAt: null,
};

const mockOrders = [
  { id: 2, status: "paid", totalAmount: 3000, createdAt: "2024-06-02T00:00:00.000Z" },
  { id: 1, status: "pending", totalAmount: 1500, createdAt: "2024-06-01T00:00:00.000Z" },
];

describe("MyPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetMe.mockResolvedValue({ data: mockProfile, error: undefined });
    mockGetOrders.mockResolvedValue({ data: mockOrders, error: undefined });
  });

  it("プロフィールが表示されること", async () => {
    render(<MyPage />);

    await waitFor(() => {
      expect(screen.getByDisplayValue("山田太郎")).toBeInTheDocument();
    });
    expect(screen.getByDisplayValue("test@example.com")).toBeInTheDocument();
    expect(screen.getByDisplayValue("東京都渋谷区")).toBeInTheDocument();
  });

  it("メールアドレス入力欄が disabled であること", async () => {
    render(<MyPage />);

    await waitFor(() => {
      expect(screen.getByDisplayValue("test@example.com")).toBeDisabled();
    });
  });

  it("注文履歴が表示されること", async () => {
    render(<MyPage />);

    await waitFor(() => {
      expect(screen.getByText("注文 #2")).toBeInTheDocument();
      expect(screen.getByText("支払い済み")).toBeInTheDocument();
      expect(screen.getByText("¥3,000")).toBeInTheDocument();
      expect(screen.getByText("未払い")).toBeInTheDocument();
    });
  });

  it("注文がない場合「まだ注文はありません」が表示されること", async () => {
    mockGetOrders.mockResolvedValue({ data: [], error: undefined });

    render(<MyPage />);

    await waitFor(() => {
      expect(screen.getByText("まだ注文はありません")).toBeInTheDocument();
    });
  });

  it("プロフィール保存成功時に成功メッセージが表示されること", async () => {
    const user = userEvent.setup();
    mockUpdateProfile.mockResolvedValue({
      data: { ...mockProfile, name: "新しい名前" },
      error: undefined,
    });

    render(<MyPage />);

    await waitFor(() => {
      expect(screen.getByDisplayValue("山田太郎")).toBeInTheDocument();
    });

    const nameInput = screen.getByDisplayValue("山田太郎");
    await user.clear(nameInput);
    await user.type(nameInput, "新しい名前");

    const saveButton = screen.getByRole("button", { name: "保存する" });
    await user.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText("プロフィールを更新しました")).toBeInTheDocument();
    });
    expect(mockUpdateProfile).toHaveBeenCalledWith(
      expect.objectContaining({ body: expect.objectContaining({ name: "新しい名前" }) }),
    );
  });

  it("プロフィール保存失敗時にエラーメッセージが表示されること", async () => {
    const user = userEvent.setup();
    mockUpdateProfile.mockResolvedValue({ data: undefined, error: "Server error" });

    render(<MyPage />);

    await waitFor(() => {
      expect(screen.getByDisplayValue("山田太郎")).toBeInTheDocument();
    });

    const saveButton = screen.getByRole("button", { name: "保存する" });
    await user.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText("更新に失敗しました")).toBeInTheDocument();
    });
  });

  it("退会ボタンを押すと確認ダイアログが表示されること", async () => {
    const user = userEvent.setup();
    render(<MyPage />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "退会する" })).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "退会する" }));

    expect(screen.getByTestId("dialog-title")).toHaveTextContent("アカウントを退会しますか？");
    expect(
      screen.getByText("この操作は取り消せません。退会後はログイン状態が解除されます。"),
    ).toBeInTheDocument();
  });

  it("退会成功時にトークンを削除してログインページへリダイレクトすること", async () => {
    const user = userEvent.setup();
    mockWithdraw.mockResolvedValue({ error: undefined });

    render(<MyPage />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "退会する" })).toBeInTheDocument();
    });

    // トリガーボタンでダイアログを開く
    await user.click(screen.getByRole("button", { name: "退会する" }));

    // ダイアログ内の確認「退会する」ボタンをクリック
    const confirmButtons = screen.getAllByRole("button", { name: "退会する" });
    await user.click(confirmButtons[confirmButtons.length - 1]);

    await waitFor(() => {
      expect(mockWithdraw).toHaveBeenCalled();
      expect(mockRemoveToken).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith({ to: "/login" });
    });
  });

  it("退会失敗時にエラーメッセージがダイアログ内に表示されること", async () => {
    const user = userEvent.setup();
    mockWithdraw.mockResolvedValue({ error: "Server error" });

    render(<MyPage />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "退会する" })).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "退会する" }));

    const confirmButtons = screen.getAllByRole("button", { name: "退会する" });
    await user.click(confirmButtons[confirmButtons.length - 1]);

    await waitFor(() => {
      expect(
        screen.getByText("退会処理に失敗しました。時間をおいてお試しください。"),
      ).toBeInTheDocument();
    });
    expect(mockRemoveToken).not.toHaveBeenCalled();
  });

  it("読み込み中は「読み込み中...」が表示されること", () => {
    mockGetMe.mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(() => resolve({ data: mockProfile, error: undefined }), 1000),
        ),
    );
    mockGetOrders.mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(() => resolve({ data: [], error: undefined }), 1000),
        ),
    );

    render(<MyPage />);

    expect(screen.getByText("読み込み中...")).toBeInTheDocument();
  });
});
