import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { AdminCategoriesPage } from "@/components/pages/AdminCategoriesPage";

const mockCategoriesControllerFindAll = vi.fn();

vi.mock("@/api/generated/sdk.gen", () => ({
  adminCategoriesControllerFindAll: (...args: unknown[]) =>
    mockCategoriesControllerFindAll(...args),
  adminCategoriesControllerCreate: vi.fn(),
  adminCategoriesControllerUpdate: vi.fn(),
  adminCategoriesControllerRemove: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  getAdminToken: () => "test-token",
}));

describe("AdminCategoriesPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("カテゴリ一覧が表示されること", async () => {
    mockCategoriesControllerFindAll.mockResolvedValue({
      data: [
        {
          id: 1,
          name: "衣類",
          parentId: null,
          children: [
            {
              id: 2,
              name: "Tシャツ",
              parentId: 1,
              children: [],
              createdAt: "2026-04-11T00:00:00Z",
            },
          ],
          createdAt: "2026-04-11T00:00:00Z",
        },
      ],
      error: undefined,
    });

    render(<AdminCategoriesPage />);

    expect(screen.getByRole("heading", { level: 1, name: "カテゴリ管理" })).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("衣類")).toBeInTheDocument();
    });

    expect(screen.getByText("Tシャツ")).toBeInTheDocument();
  });

  it("エラー時にエラーメッセージが表示されること", async () => {
    mockCategoriesControllerFindAll.mockResolvedValue({
      data: undefined,
      error: "Failed to fetch",
    });

    render(<AdminCategoriesPage />);

    await waitFor(() => {
      expect(screen.getByText("カテゴリ一覧の取得に失敗しました")).toBeInTheDocument();
    });
  });
});
