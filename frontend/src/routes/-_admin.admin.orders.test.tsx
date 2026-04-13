import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AdminOrdersPage } from "@/components/pages/AdminOrdersPage";

const mockFindAll = vi.fn();
const mockFindById = vi.fn();
const mockUpdateStatus = vi.fn();
const mockCancelOrder = vi.fn();

vi.mock("@/api/generated/sdk.gen", () => ({
  adminOrdersControllerFindAll: (...args: unknown[]) => mockFindAll(...args),
  adminOrdersControllerFindById: (...args: unknown[]) => mockFindById(...args),
  adminOrdersControllerUpdateStatus: (...args: unknown[]) => mockUpdateStatus(...args),
  adminOrdersControllerCancelOrder: (...args: unknown[]) => mockCancelOrder(...args),
}));

vi.mock("@/lib/auth", () => ({
  getAdminToken: () => "test-token",
}));

const orderListResponse = () => ({
  data: {
    items: [
      {
        id: 1,
        status: "paid",
        totalAmount: 10500,
        createdAt: "2026-04-01T00:00:00Z",
        user: { id: 1, name: "山田太郎", email: "yamada@example.com" },
      },
    ],
    page: 1,
    limit: 20,
    total: 1,
  },
  error: undefined,
});

const orderDetailResponse = () => ({
  data: {
    id: 1,
    status: "paid",
    shippingAddress: {
      zip: "100-0001",
      prefecture: "東京都",
      city: "千代田区",
      address1: "1-1",
    },
    shippingFee: 500,
    totalAmount: 10500,
    createdAt: "2026-04-01T00:00:00Z",
    user: { id: 1, name: "山田太郎", email: "yamada@example.com" },
    items: [
      {
        id: 1,
        productName: "テストシャツ",
        size: "M",
        color: "white",
        quantity: 2,
        price: 5000,
      },
    ],
  },
  error: undefined,
});

describe("AdminOrdersPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("注文一覧が表示されること", async () => {
    mockFindAll.mockResolvedValue(orderListResponse());

    render(<AdminOrdersPage />);

    await waitFor(() => {
      expect(screen.getByText("yamada@example.com")).toBeInTheDocument();
    });
    expect(screen.getByText("山田太郎")).toBeInTheDocument();
    expect(screen.getByText("paid")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "詳細" })).toBeInTheDocument();
  });

  it("詳細ボタンで注文詳細が表示されること", async () => {
    mockFindAll.mockResolvedValue(orderListResponse());
    mockFindById.mockResolvedValue(orderDetailResponse());

    const user = userEvent.setup();
    render(<AdminOrdersPage />);

    await waitFor(() =>
      expect(screen.getByText("yamada@example.com")).toBeInTheDocument(),
    );

    await user.click(screen.getByRole("button", { name: "詳細" }));

    await waitFor(() =>
      expect(screen.getByText("テストシャツ")).toBeInTheDocument(),
    );
    expect(screen.getByText(/100-0001/)).toBeInTheDocument();
  });

  it("ステータス更新ボタンで発送済みに変更できること", async () => {
    mockFindAll.mockResolvedValue(orderListResponse());
    mockFindById.mockResolvedValue(orderDetailResponse());
    mockUpdateStatus.mockResolvedValue({ data: undefined, error: undefined });

    const user = userEvent.setup();
    render(<AdminOrdersPage />);

    await waitFor(() =>
      expect(screen.getByText("yamada@example.com")).toBeInTheDocument(),
    );

    await user.click(screen.getByRole("button", { name: "詳細" }));
    await waitFor(() =>
      expect(screen.getByText("テストシャツ")).toBeInTheDocument(),
    );

    await user.click(screen.getByRole("button", { name: "発送済みにする" }));

    await waitFor(() =>
      expect(screen.getByText("ステータスを更新しました")).toBeInTheDocument(),
    );
    expect(mockUpdateStatus).toHaveBeenCalledWith(
      expect.objectContaining({
        path: { id: 1 },
        body: { status: "shipped" },
      }),
    );
    // 詳細も再取得すること（2回目の呼び出し）
    expect(mockFindById).toHaveBeenCalledTimes(2);
  });

  it("キャンセル・返金ボタンで注文をキャンセルできること", async () => {
    mockFindAll.mockResolvedValue(orderListResponse());
    mockFindById.mockResolvedValue(orderDetailResponse());
    mockCancelOrder.mockResolvedValue({ data: undefined, error: undefined });

    const user = userEvent.setup();
    render(<AdminOrdersPage />);

    await waitFor(() =>
      expect(screen.getByText("yamada@example.com")).toBeInTheDocument(),
    );

    await user.click(screen.getByRole("button", { name: "詳細" }));
    await waitFor(() =>
      expect(screen.getByText("テストシャツ")).toBeInTheDocument(),
    );

    await user.click(screen.getByRole("button", { name: "キャンセル・返金" }));

    await waitFor(() =>
      expect(screen.getByText("注文をキャンセルしました")).toBeInTheDocument(),
    );
    expect(mockCancelOrder).toHaveBeenCalledWith(
      expect.objectContaining({ path: { id: 1 } }),
    );
    // 詳細も再取得すること（2回目の呼び出し）
    expect(mockFindById).toHaveBeenCalledTimes(2);
  });

  it("注文一覧の取得に失敗したとき、エラーメッセージが表示されること", async () => {
    mockFindAll.mockResolvedValue({ data: undefined, error: { message: "Server Error" } });

    render(<AdminOrdersPage />);

    await waitFor(() => {
      expect(
        screen.getByText("注文一覧の取得に失敗しました"),
      ).toBeInTheDocument();
    });
  });

  it("注文詳細の取得に失敗したとき、エラーメッセージが表示されること", async () => {
    mockFindAll.mockResolvedValue(orderListResponse());
    mockFindById.mockResolvedValue({ data: undefined, error: { message: "Not Found" } });

    const user = userEvent.setup();
    render(<AdminOrdersPage />);

    await waitFor(() =>
      expect(screen.getByText("yamada@example.com")).toBeInTheDocument(),
    );

    await user.click(screen.getByRole("button", { name: "詳細" }));

    await waitFor(() => {
      expect(
        screen.getByText("注文詳細の取得に失敗しました"),
      ).toBeInTheDocument();
    });
  });

  it("詳細取得に失敗したとき、前回の詳細が残らないこと", async () => {
    // 1回目: 詳細取得成功
    mockFindAll.mockResolvedValue(orderListResponse());
    mockFindById
      .mockResolvedValueOnce(orderDetailResponse())
      .mockResolvedValueOnce({ data: undefined, error: { message: "Not Found" } });

    const user = userEvent.setup();
    render(<AdminOrdersPage />);

    await waitFor(() =>
      expect(screen.getByText("yamada@example.com")).toBeInTheDocument(),
    );

    // 1回目クリック: 詳細が表示される
    await user.click(screen.getByRole("button", { name: "詳細" }));
    await waitFor(() =>
      expect(screen.getByText("テストシャツ")).toBeInTheDocument(),
    );

    // 2回目クリック: 取得失敗 → 前回の詳細が消えてエラーのみ表示
    await user.click(screen.getByRole("button", { name: "詳細" }));
    await waitFor(() =>
      expect(
        screen.getByText("注文詳細の取得に失敗しました"),
      ).toBeInTheDocument(),
    );
    expect(screen.queryByText("テストシャツ")).not.toBeInTheDocument();
  });

  it("ステータス更新に失敗したとき、エラーメッセージが表示されること", async () => {
    mockFindAll.mockResolvedValue(orderListResponse());
    mockFindById.mockResolvedValue(orderDetailResponse());
    mockUpdateStatus.mockResolvedValue({ data: undefined, error: { message: "Bad Request" } });

    const user = userEvent.setup();
    render(<AdminOrdersPage />);

    await waitFor(() =>
      expect(screen.getByText("yamada@example.com")).toBeInTheDocument(),
    );

    await user.click(screen.getByRole("button", { name: "詳細" }));
    await waitFor(() =>
      expect(screen.getByText("テストシャツ")).toBeInTheDocument(),
    );

    await user.click(screen.getByRole("button", { name: "発送済みにする" }));

    await waitFor(() => {
      expect(
        screen.getByText("ステータスの更新に失敗しました"),
      ).toBeInTheDocument();
    });
  });

  it("キャンセルに失敗したとき、エラーメッセージが表示されること", async () => {
    mockFindAll.mockResolvedValue(orderListResponse());
    mockFindById.mockResolvedValue(orderDetailResponse());
    mockCancelOrder.mockResolvedValue({ data: undefined, error: { message: "Bad Request" } });

    const user = userEvent.setup();
    render(<AdminOrdersPage />);

    await waitFor(() =>
      expect(screen.getByText("yamada@example.com")).toBeInTheDocument(),
    );

    await user.click(screen.getByRole("button", { name: "詳細" }));
    await waitFor(() =>
      expect(screen.getByText("テストシャツ")).toBeInTheDocument(),
    );

    await user.click(screen.getByRole("button", { name: "キャンセル・返金" }));

    await waitFor(() => {
      expect(
        screen.getByText("返金に失敗しました（注文はキャンセル済みの可能性があります）"),
      ).toBeInTheDocument();
    });
  });
});
