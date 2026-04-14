import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { AdminDashboardPage } from "./_admin.admin.dashboard";

const mockFindAllOrders = vi.fn();
const mockFindAllMembers = vi.fn();
const mockFindAllProducts = vi.fn();

vi.mock("@/api/generated/sdk.gen", () => ({
  adminOrdersControllerFindAll: (...args: unknown[]) => mockFindAllOrders(...args),
  adminMembersControllerFindAll: (...args: unknown[]) => mockFindAllMembers(...args),
  productsControllerFindAll: (...args: unknown[]) => mockFindAllProducts(...args),
}));

vi.mock("@/lib/auth", () => ({
  getAdminToken: () => "admin-test-token",
}));

vi.mock("@/components/layouts/AdminLayout", () => ({
  AdminLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

const makeOrderItem = (id: number, totalAmount: number, createdAt: string) => ({
  id,
  status: "paid" as const,
  totalAmount,
  createdAt,
  user: { id: 1, name: `テストユーザー${id}`, email: `user${id}@example.com` },
});

beforeEach(() => {
  vi.clearAllMocks();

  mockFindAllOrders.mockResolvedValue({
    data: {
      items: [makeOrderItem(1, 5000, "2026-04-01T10:00:00Z")],
      total: 7,
      page: 1,
      limit: 20,
    },
    error: null,
  });

  mockFindAllMembers.mockResolvedValue({
    data: { items: [], total: 12, page: 1, limit: 1 },
    error: null,
  });

  mockFindAllProducts.mockResolvedValue({
    data: { data: [], total: 9, page: 1, limit: 1 },
    error: null,
  });
});

describe("Admin Dashboard Page", () => {
  it("ダッシュボードの見出しと統計ラベルが表示されること", async () => {
    render(<AdminDashboardPage />);

    expect(screen.getByText("管理ダッシュボード")).toBeInTheDocument();
    expect(screen.getByText("総注文数")).toBeInTheDocument();
    expect(screen.getByText("総会員数")).toBeInTheDocument();
    expect(screen.getByText("総商品数")).toBeInTheDocument();
    expect(screen.getByText("今月の売上")).toBeInTheDocument();
    expect(screen.getByText("最近の注文")).toBeInTheDocument();
  });

  it("APIから取得した統計データが表示されること", async () => {
    render(<AdminDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText("7")).toBeInTheDocument();   // 総注文数
      expect(screen.getByText("12")).toBeInTheDocument();  // 総会員数
      expect(screen.getByText("9")).toBeInTheDocument();   // 総商品数
    });
  });

  it("最近の注文テーブルが表示されること", async () => {
    render(<AdminDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText("テストユーザー1")).toBeInTheDocument();
      expect(screen.getByText("支払済")).toBeInTheDocument();
      // 金額はカードと重複しないよう getAllByText で確認
      const amounts = screen.getAllByText("¥5,000");
      expect(amounts.length).toBeGreaterThanOrEqual(1);
    });
  });

  it("API失敗時にエラーメッセージが表示されること", async () => {
    mockFindAllOrders.mockResolvedValue({ data: null, error: { message: "error" } });

    render(<AdminDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText("データの取得に失敗しました")).toBeInTheDocument();
    });
  });
});
