import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AdminMembersPage } from "@/components/pages/AdminMembersPage";

const mockFindAll = vi.fn();
const mockFindById = vi.fn();
const mockDelete = vi.fn();

vi.mock("@/api/generated/sdk.gen", () => ({
  adminMembersControllerFindAll: (...args: unknown[]) => mockFindAll(...args),
  adminMembersControllerFindById: (...args: unknown[]) => mockFindById(...args),
  adminMembersControllerDelete: (...args: unknown[]) => mockDelete(...args),
}));

vi.mock("@/lib/auth", () => ({
  getAdminToken: () => "test-token",
}));

const memberListResponse = (overrides: { deletedAt?: string | null } = {}) => ({
  data: {
    items: [
      {
        id: 1,
        name: "一般会員",
        email: "user@example.com",
        createdAt: "2026-04-12T00:00:00Z",
        deletedAt: overrides.deletedAt ?? null,
      },
    ],
    page: 1,
    limit: 20,
    total: 1,
  },
  error: undefined,
});

const memberDetailResponse = () => ({
  data: {
    id: 1,
    name: "一般会員",
    email: "user@example.com",
    address: "東京都千代田区1-1-1",
    createdAt: "2026-04-12T00:00:00Z",
    deletedAt: null,
    orders: [
      {
        id: 10,
        status: "paid",
        totalAmount: 10000,
        createdAt: "2026-04-12T01:00:00Z",
      },
    ],
  },
  error: undefined,
});

describe("AdminMembersPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("会員一覧が表示されること", async () => {
    mockFindAll.mockResolvedValue(memberListResponse());

    render(<AdminMembersPage />);

    await waitFor(() => {
      expect(screen.getByText("user@example.com")).toBeInTheDocument();
    });
    expect(screen.getByText("一般会員")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "詳細" })).toBeInTheDocument();
  });

  it("詳細表示と削除操作が動作すること", async () => {
    mockFindAll
      .mockResolvedValueOnce(memberListResponse())
      .mockResolvedValueOnce(memberListResponse({ deletedAt: "2026-04-12T02:00:00Z" }));
    mockFindById.mockResolvedValue(memberDetailResponse());
    mockDelete.mockResolvedValue({ data: undefined, error: undefined });

    const user = userEvent.setup();
    render(<AdminMembersPage />);

    await waitFor(() =>
      expect(screen.getByText("user@example.com")).toBeInTheDocument(),
    );

    await user.click(screen.getByRole("button", { name: "詳細" }));
    await waitFor(() =>
      expect(screen.getByText("東京都千代田区1-1-1")).toBeInTheDocument(),
    );

    await user.click(screen.getByRole("button", { name: "削除" }));
    await waitFor(() =>
      expect(screen.getByText("会員を削除しました")).toBeInTheDocument(),
    );

    expect(mockDelete).toHaveBeenCalledWith(
      expect.objectContaining({ path: { id: 1 } }),
    );
  });

  it("会員一覧の取得に失敗したとき、エラーメッセージが表示されること", async () => {
    mockFindAll.mockResolvedValue({ data: undefined, error: { message: "Server Error" } });

    render(<AdminMembersPage />);

    await waitFor(() => {
      expect(
        screen.getByText("会員一覧の取得に失敗しました"),
      ).toBeInTheDocument();
    });
  });

  it("会員詳細の取得に失敗したとき、エラーメッセージが表示されること", async () => {
    mockFindAll.mockResolvedValue(memberListResponse());
    mockFindById.mockResolvedValue({ data: undefined, error: { message: "Not Found" } });

    const user = userEvent.setup();
    render(<AdminMembersPage />);

    await waitFor(() =>
      expect(screen.getByText("user@example.com")).toBeInTheDocument(),
    );

    await user.click(screen.getByRole("button", { name: "詳細" }));

    await waitFor(() => {
      expect(
        screen.getByText("会員詳細の取得に失敗しました"),
      ).toBeInTheDocument();
    });
  });

  it("会員削除に失敗したとき、エラーメッセージが表示されること", async () => {
    mockFindAll.mockResolvedValue(memberListResponse());
    mockDelete.mockResolvedValue({ data: undefined, error: { message: "Server Error" } });

    const user = userEvent.setup();
    render(<AdminMembersPage />);

    await waitFor(() =>
      expect(screen.getByText("user@example.com")).toBeInTheDocument(),
    );

    await user.click(screen.getByRole("button", { name: "削除" }));

    await waitFor(() => {
      expect(
        screen.getByText("会員の削除に失敗しました"),
      ).toBeInTheDocument();
    });
  });
});
