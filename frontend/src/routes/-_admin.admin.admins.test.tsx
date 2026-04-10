import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockFindAllAdmins = vi.fn();

vi.mock("@/api/generated/sdk.gen", () => ({
  adminAccountsControllerFindAll: (...args: unknown[]) =>
    mockFindAllAdmins(...args),
}));

import { Route } from "./_admin.admin.admins";

const AdminAdminsPage = Route.options.component as NonNullable<
  typeof Route.options.component
>;

describe("admin admins page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("取得成功時、管理者一覧を表示すること", async () => {
    mockFindAllAdmins.mockResolvedValue({
      data: [
        {
          id: 1,
          name: "スーパー管理者",
          email: "super@example.com",
          role: "super",
          createdAt: "2026-04-10T00:00:00.000Z",
        },
      ],
      error: undefined,
    });

    render(<AdminAdminsPage />);

    expect(screen.getByText("読み込み中...")).toBeInTheDocument();

    await waitFor(() => {
      expect(mockFindAllAdmins).toHaveBeenCalledWith({
        throwOnError: false,
      });
    });

    expect(
      await screen.findByRole("cell", { name: "スーパー管理者" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("cell", { name: "super@example.com" }),
    ).toBeInTheDocument();
    expect(screen.queryByText("読み込み中...")).not.toBeInTheDocument();
  });

  it("取得失敗時、エラーメッセージを表示すること", async () => {
    mockFindAllAdmins.mockResolvedValue({
      data: undefined,
      error: { message: "Unauthorized" },
    });

    render(<AdminAdminsPage />);

    expect(
      await screen.findByText("管理者一覧の取得に失敗しました"),
    ).toBeInTheDocument();
  });
});
