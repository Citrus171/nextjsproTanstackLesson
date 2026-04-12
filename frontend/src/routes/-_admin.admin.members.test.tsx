import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AdminMembersPage } from "@/components/pages/AdminMembersPage";

vi.mock("@/lib/auth", () => ({
  getAdminToken: () => "test-token",
}));

describe("AdminMembersPage", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("会員一覧が表示されること", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        items: [
          {
            id: 1,
            name: "一般会員",
            email: "user@example.com",
            createdAt: "2026-04-12T00:00:00Z",
            deletedAt: null,
          },
        ],
        page: 1,
        limit: 20,
        total: 1,
      }),
    });

    render(<AdminMembersPage />);

    await waitFor(() => {
      expect(screen.getByText("user@example.com")).toBeInTheDocument();
    });
    expect(screen.getByText("一般会員")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "詳細" })).toBeInTheDocument();
  });

  it("詳細表示と削除操作が動作すること", async () => {
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          items: [
            {
              id: 1,
              name: "一般会員",
              email: "user@example.com",
              createdAt: "2026-04-12T00:00:00Z",
              deletedAt: null,
            },
          ],
          page: 1,
          limit: 20,
          total: 1,
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
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
        }),
      })
      .mockResolvedValueOnce({ ok: true, status: 204 })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          items: [
            {
              id: 1,
              name: "一般会員",
              email: "user@example.com",
              createdAt: "2026-04-12T00:00:00Z",
              deletedAt: "2026-04-12T02:00:00Z",
            },
          ],
          page: 1,
          limit: 20,
          total: 1,
        }),
      });

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

    expect(fetchMock).toHaveBeenNthCalledWith(
      3,
      "/admin/members/1",
      expect.objectContaining({ method: "DELETE" }),
    );
  });

  it("会員一覧の取得に失敗したとき、エラーメッセージが表示されること", async () => {
    fetchMock.mockResolvedValueOnce({ ok: false, status: 500 });

    render(<AdminMembersPage />);

    await waitFor(() => {
      expect(
        screen.getByText("会員一覧の取得に失敗しました"),
      ).toBeInTheDocument();
    });
  });

  it("会員詳細の取得に失敗したとき、エラーメッセージが表示されること", async () => {
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          items: [
            {
              id: 1,
              name: "一般会員",
              email: "user@example.com",
              createdAt: "2026-04-12T00:00:00Z",
              deletedAt: null,
            },
          ],
          page: 1,
          limit: 20,
          total: 1,
        }),
      })
      .mockResolvedValueOnce({ ok: false, status: 404 });

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
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          items: [
            {
              id: 1,
              name: "一般会員",
              email: "user@example.com",
              createdAt: "2026-04-12T00:00:00Z",
              deletedAt: null,
            },
          ],
          page: 1,
          limit: 20,
          total: 1,
        }),
      })
      .mockResolvedValueOnce({ ok: false, status: 500 });

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
