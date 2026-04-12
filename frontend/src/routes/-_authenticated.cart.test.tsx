import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { CartPage } from "@/components/pages/CartPage";

const mockGetCart = vi.fn();
const mockUpdateItem = vi.fn();
const mockRemoveItem = vi.fn();

vi.mock("@/api/generated/sdk.gen", () => ({
  cartsControllerGetCart: (...args: unknown[]) => mockGetCart(...args),
  cartsControllerUpdateItem: (...args: unknown[]) => mockUpdateItem(...args),
  cartsControllerRemoveItem: (...args: unknown[]) => mockRemoveItem(...args),
}));

vi.mock("sonner", () => ({
  toast: { warning: vi.fn(), error: vi.fn(), success: vi.fn() },
}));

vi.mock("@/lib/auth", () => ({
  getToken: () => "test-token",
}));

describe("Cart Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
});
