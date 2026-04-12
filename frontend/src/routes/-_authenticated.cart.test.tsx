import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import * as sonner from "sonner";
import { CartPage } from "@/components/pages/CartPage";

const mockGetCart = vi.fn();
const mockUpdateItem = vi.fn();
const mockRemoveItem = vi.fn();

vi.mock("@/api/generated/sdk.gen", () => ({
  cartsControllerGetCart: (...args: unknown[]) => mockGetCart(...args),
  cartsControllerUpdateItem: (...args: unknown[]) => mockUpdateItem(...args),
  cartsControllerRemoveItem: (...args: unknown[]) => mockRemoveItem(...args),
}));

vi.mock("@/lib/auth", () => ({
  getToken: () => "test-token",
}));

describe("Cart Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(sonner.toast, "warning");
    vi.spyOn(sonner.toast, "error");
    vi.spyOn(sonner.toast, "success");
  });

  it("カートアイテムが一覧表示されること", async () => {
    mockGetCart.mockResolvedValue({
      data: [
        {
          id: 1,
          variationId: 100,
          quantity: 2,
          status: "reserved",
          variation: {
            id: 100,
            size: "M",
            color: "red",
            price: 1000,
            product: {
              id: 1,
              name: "Tシャツ",
            },
          },
        },
      ],
      error: undefined,
    });

    render(<CartPage />);

    await waitFor(() => {
      expect(screen.getByText("Tシャツ")).toBeInTheDocument();
      expect(screen.getByText(/M/)).toBeInTheDocument();
      expect(screen.getByText(/red/)).toBeInTheDocument();
    });
  });

  it("空カート時にメッセージが表示されること", async () => {
    mockGetCart.mockResolvedValue({
      data: [],
      error: undefined,
    });

    render(<CartPage />);

    await waitFor(() => {
      expect(screen.getByText("カートは空です")).toBeInTheDocument();
    });
  });

  it("削除ボタンクリックでremoveItemが呼ばれること", async () => {
    const user = userEvent.setup();
    mockGetCart.mockResolvedValue({
      data: [
        {
          id: 1,
          variationId: 100,
          quantity: 2,
          status: "reserved",
          expiresAt: new Date(Date.now() + 30 * 60 * 1000),
          variation: {
            id: 100,
            size: "M",
            color: "red",
            price: 1000,
            product: {
              id: 1,
              name: "Tシャツ",
            },
          },
        },
      ],
      error: undefined,
    });

    mockRemoveItem.mockResolvedValue({ data: undefined, error: undefined });

    render(<CartPage />);

    await waitFor(() => {
      expect(screen.getByText("Tシャツ")).toBeInTheDocument();
    });

    const deleteButton = screen.getByRole("button", { name: "削除" });
    await user.click(deleteButton);

    await waitFor(() => {
      expect(mockRemoveItem).toHaveBeenCalled();
    });
  });

  it("数量増加ボタンでupdateItemが呼ばれること", async () => {
    const user = userEvent.setup();
    mockGetCart.mockResolvedValue({
      data: [
        {
          id: 1,
          variationId: 100,
          quantity: 2,
          status: "reserved",
          expiresAt: new Date(Date.now() + 30 * 60 * 1000),
          variation: {
            id: 100,
            size: "M",
            color: "red",
            price: 1000,
            product: {
              id: 1,
              name: "Tシャツ",
            },
          },
        },
      ],
      error: undefined,
    });

    mockUpdateItem.mockResolvedValue({ data: undefined, error: undefined });

    render(<CartPage />);

    await waitFor(() => {
      expect(screen.getByText("Tシャツ")).toBeInTheDocument();
    });

    const increaseButton = screen.getByRole("button", { name: "＋" });
    await user.click(increaseButton);

    await waitFor(() => {
      expect(mockUpdateItem).toHaveBeenCalled();
    });
  });

  it("数量減少ボタンでupdateItemが呼ばれること", async () => {
    const user = userEvent.setup();
    mockGetCart.mockResolvedValue({
      data: [
        {
          id: 1,
          variationId: 100,
          quantity: 3,
          status: "reserved",
          expiresAt: new Date(Date.now() + 30 * 60 * 1000),
          variation: {
            id: 100,
            size: "M",
            color: "red",
            price: 1000,
            product: {
              id: 1,
              name: "Tシャツ",
            },
          },
        },
      ],
      error: undefined,
    });

    mockUpdateItem.mockResolvedValue({ data: undefined, error: undefined });

    render(<CartPage />);

    await waitFor(() => {
      expect(screen.getByText("Tシャツ")).toBeInTheDocument();
    });

    const decreaseButton = screen.getByRole("button", { name: "−" });
    await user.click(decreaseButton);

    await waitFor(() => {
      expect(mockUpdateItem).toHaveBeenCalled();
    });
  });

  it("数量が1のときは減少ボタンが disabled になること", async () => {
    mockGetCart.mockResolvedValue({
      data: [
        {
          id: 1,
          variationId: 100,
          quantity: 1,
          status: "reserved",
          expiresAt: new Date(Date.now() + 30 * 60 * 1000),
          variation: {
            id: 100,
            size: "M",
            color: "red",
            price: 1000,
            product: {
              id: 1,
              name: "Tシャツ",
            },
          },
        },
      ],
      error: undefined,
    });

    render(<CartPage />);

    await waitFor(() => {
      expect(screen.getByText("Tシャツ")).toBeInTheDocument();
    });

    const decreaseButton = screen.getByRole("button", { name: "−" });
    expect(decreaseButton).toBeDisabled();
  });

  it("getCart API エラー時にトースト表示されること", async () => {
    mockGetCart.mockResolvedValue({
      data: undefined,
      error: "Network error",
    });

    render(<CartPage />);

    await waitFor(() => {
      expect(sonner.toast.error).toHaveBeenCalledWith("カートの読み込みに失敗しました");
    });
  });

  it("removeItem API エラー時にトースト表示されること", async () => {
    const user = userEvent.setup();
    mockGetCart.mockResolvedValue({
      data: [
        {
          id: 1,
          variationId: 100,
          quantity: 2,
          status: "reserved",
          expiresAt: new Date(Date.now() + 30 * 60 * 1000),
          variation: {
            id: 100,
            size: "M",
            color: "red",
            price: 1000,
            product: {
              id: 1,
              name: "Tシャツ",
            },
          },
        },
      ],
      error: undefined,
    });

    mockRemoveItem.mockResolvedValue({
      data: undefined,
      error: "Network error",
    });

    render(<CartPage />);

    await waitFor(() => {
      expect(screen.getByText("Tシャツ")).toBeInTheDocument();
    });

    const deleteButton = screen.getByRole("button", { name: "削除" });
    await user.click(deleteButton);

    await waitFor(() => {
      expect(sonner.toast.error).toHaveBeenCalledWith("削除に失敗しました");
    });
  });

  it("updateItem API エラー時にトースト表示されること", async () => {
    const user = userEvent.setup();
    mockGetCart.mockResolvedValue({
      data: [
        {
          id: 1,
          variationId: 100,
          quantity: 2,
          status: "reserved",
          expiresAt: new Date(Date.now() + 30 * 60 * 1000),
          variation: {
            id: 100,
            size: "M",
            color: "red",
            price: 1000,
            product: {
              id: 1,
              name: "Tシャツ",
            },
          },
        },
      ],
      error: undefined,
    });

    mockUpdateItem.mockResolvedValue({
      data: undefined,
      error: "Network error",
    });

    render(<CartPage />);

    await waitFor(() => {
      expect(screen.getByText("Tシャツ")).toBeInTheDocument();
    });

    const increaseButton = screen.getByRole("button", { name: "＋" });
    await user.click(increaseButton);

    await waitFor(() => {
      expect(sonner.toast.error).toHaveBeenCalledWith("更新に失敗しました");
    });
  });

  it("期限切れアイテムがある場合に警告トースト表示されること", async () => {
    mockGetCart.mockResolvedValue({
      data: [
        {
          id: 1,
          variationId: 100,
          quantity: 2,
          status: "reserved",
          expiresAt: new Date(Date.now() - 1 * 60 * 1000), // 1分前
          variation: {
            id: 100,
            size: "M",
            color: "red",
            price: 1000,
            product: {
              id: 1,
              name: "Tシャツ",
            },
          },
        },
      ],
      error: undefined,
    });

    render(<CartPage />);

    await waitFor(() => {
      expect(sonner.toast.warning).toHaveBeenCalledWith("カートの一部が期限切れになりました");
    });
  });

  it("期限切れアイテムがない場合は警告トースト表示されないこと", async () => {
    mockGetCart.mockResolvedValue({
      data: [
        {
          id: 1,
          variationId: 100,
          quantity: 2,
          status: "reserved",
          expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30分後
          variation: {
            id: 100,
            size: "M",
            color: "red",
            price: 1000,
            product: {
              id: 1,
              name: "Tシャツ",
            },
          },
        },
      ],
      error: undefined,
    });

    render(<CartPage />);

    await waitFor(() => {
      expect(screen.getByText("Tシャツ")).toBeInTheDocument();
    });

    expect(sonner.toast.warning).not.toHaveBeenCalled();
  });

  it("読み込み中に「読み込み中...」と表示されること", () => {
    mockGetCart.mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(
            () =>
              resolve({
                data: [],
                error: undefined,
              }),
            1000,
          );
        }),
    );

    const { container } = render(<CartPage />);

    expect(container.textContent).toContain("読み込み中...");
  });

  it("removeItem API がエラーをthrowした場合にエラートースト表示されること", async () => {
    const user = userEvent.setup();
    mockGetCart.mockResolvedValue({
      data: [
        {
          id: 1,
          variationId: 100,
          quantity: 2,
          status: "reserved",
          expiresAt: new Date(Date.now() + 30 * 60 * 1000),
          variation: {
            id: 100,
            size: "M",
            color: "red",
            price: 1000,
            product: {
              id: 1,
              name: "Tシャツ",
            },
          },
        },
      ],
      error: undefined,
    });

    mockRemoveItem.mockRejectedValue(new Error("Network error"));

    render(<CartPage />);

    await waitFor(() => {
      expect(screen.getByText("Tシャツ")).toBeInTheDocument();
    });

    const deleteButton = screen.getByRole("button", { name: "削除" });
    await user.click(deleteButton);

    await waitFor(() => {
      expect(sonner.toast.error).toHaveBeenCalledWith("削除に失敗しました");
    });
  });

  it("updateItem API がエラーをthrowした場合にエラートースト表示されること", async () => {
    const user = userEvent.setup();
    mockGetCart.mockResolvedValue({
      data: [
        {
          id: 1,
          variationId: 100,
          quantity: 2,
          status: "reserved",
          expiresAt: new Date(Date.now() + 30 * 60 * 1000),
          variation: {
            id: 100,
            size: "M",
            color: "red",
            price: 1000,
            product: {
              id: 1,
              name: "Tシャツ",
            },
          },
        },
      ],
      error: undefined,
    });

    mockUpdateItem.mockRejectedValue(new Error("Network error"));

    render(<CartPage />);

    await waitFor(() => {
      expect(screen.getByText("Tシャツ")).toBeInTheDocument();
    });

    const increaseButton = screen.getByRole("button", { name: "＋" });
    await user.click(increaseButton);

    await waitFor(() => {
      expect(sonner.toast.error).toHaveBeenCalledWith("更新に失敗しました");
    });
  });

  it("複数アイテムの場合、更新時に他のアイテムは変わらないこと", async () => {
    const user = userEvent.setup();
    mockGetCart.mockResolvedValue({
      data: [
        {
          id: 1,
          variationId: 100,
          quantity: 2,
          status: "reserved",
          expiresAt: new Date(Date.now() + 30 * 60 * 1000),
          variation: {
            id: 100,
            size: "M",
            color: "red",
            price: 1000,
            product: {
              id: 1,
              name: "Tシャツ",
            },
          },
        },
        {
          id: 2,
          variationId: 101,
          quantity: 1,
          status: "reserved",
          expiresAt: new Date(Date.now() + 30 * 60 * 1000),
          variation: {
            id: 101,
            size: "L",
            color: "blue",
            price: 1500,
            product: {
              id: 2,
              name: "パンツ",
            },
          },
        },
      ],
      error: undefined,
    });

    mockUpdateItem.mockResolvedValue({ data: undefined, error: undefined });

    render(<CartPage />);

    await waitFor(() => {
      expect(screen.getByText("Tシャツ")).toBeInTheDocument();
      expect(screen.getByText("パンツ")).toBeInTheDocument();
    });

    // 最初のアイテムの数量増加ボタン（複数の＋ボタンがある場合、最初のものをクリック）
    const increaseButtons = screen.getAllByRole("button", { name: "＋" });
    await user.click(increaseButtons[0]);

    await waitFor(() => {
      expect(sonner.toast.success).toHaveBeenCalledWith("更新しました");
    });

    // 両方のアイテムがまだ存在することを確認
    expect(screen.getByText("Tシャツ")).toBeInTheDocument();
    expect(screen.getByText("パンツ")).toBeInTheDocument();
  });
});
