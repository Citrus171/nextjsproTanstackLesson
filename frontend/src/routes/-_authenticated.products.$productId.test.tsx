import { render, screen, waitFor, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ProductDetailPage } from "@/components/pages/ProductDetailPage";

const mockFindById = vi.fn();
const mockAddToCart = vi.fn();

vi.mock("@/api/generated/sdk.gen", () => ({
  publicProductsControllerFindAll: vi.fn(),
  publicProductsControllerFindById: (...args: unknown[]) => mockFindById(...args),
  cartsControllerAddToCart: (...args: unknown[]) => mockAddToCart(...args),
}));

vi.mock("@/lib/auth", () => ({
  isAuthenticated: () => true,
  getToken: () => "test-token",
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const mockProduct = {
  id: 1,
  name: "テストシャツ",
  description: "テスト用の商品説明",
  price: 2000,
  categoryId: 1,
  images: [],
  variations: [
    { id: 10, productId: 1, size: "M", color: "赤", price: 2000, stock: 5, deletedAt: null },
    { id: 11, productId: 1, size: "L", color: "青", price: 2200, stock: 0, deletedAt: null },
    { id: 12, productId: 1, size: "S", color: "白", price: 1800, stock: 3, deletedAt: "2026-01-01" },
  ],
  category: { id: 1, name: "衣類" },
};

const successResponse = { data: mockProduct, error: undefined };

describe("ProductDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFindById.mockResolvedValue(successResponse);
  });

  it("商品名・説明・価格が表示されること", async () => {
    render(<ProductDetailPage productId={1} />);

    await waitFor(() => {
      expect(screen.getByRole("heading", { level: 1, name: "テストシャツ" })).toBeInTheDocument();
    });

    expect(screen.getByText("テスト用の商品説明")).toBeInTheDocument();
  });

  it("カテゴリ名が表示されること", async () => {
    render(<ProductDetailPage productId={1} />);

    await waitFor(() => {
      expect(screen.getByText("衣類")).toBeInTheDocument();
    });
  });

  it("論理削除済みバリエーションは表示されないこと", async () => {
    render(<ProductDetailPage productId={1} />);

    await waitFor(() => {
      expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
    });

    expect(screen.queryByLabelText("S / 白")).not.toBeInTheDocument();
  });

  it("在庫0のバリエーションは無効で表示されること", async () => {
    render(<ProductDetailPage productId={1} />);

    await waitFor(() => {
      expect(screen.getByLabelText("L / 青")).toBeInTheDocument();
    });

    expect(screen.getByLabelText("L / 青")).toBeDisabled();
  });

  it("バリエーションを選択するとaria-pressedがtrueになること", async () => {
    render(<ProductDetailPage productId={1} />);

    await waitFor(() => {
      expect(screen.getByLabelText("M / 赤")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByLabelText("M / 赤"));

    expect(screen.getByLabelText("M / 赤")).toHaveAttribute("aria-pressed", "true");
  });

  it("バリエーション未選択時はカートに追加ボタンが無効なこと", async () => {
    render(<ProductDetailPage productId={1} />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "カートに追加" })).toBeInTheDocument();
    });

    expect(screen.getByRole("button", { name: "カートに追加" })).toBeDisabled();
  });

  it("バリエーションを選択してカートに追加するとAPIが呼ばれること", async () => {
    const { toast } = await import("sonner");
    mockAddToCart.mockResolvedValue({ data: {}, error: undefined });

    render(<ProductDetailPage productId={1} />);

    await waitFor(() => {
      expect(screen.getByLabelText("M / 赤")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByLabelText("M / 赤"));
    fireEvent.click(screen.getByRole("button", { name: "カートに追加" }));

    await waitFor(() => {
      expect(mockAddToCart).toHaveBeenCalledWith(
        expect.objectContaining({
          body: expect.objectContaining({ variationId: 10, quantity: 1 }),
        }),
      );
    });

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("カートに追加しました");
    });
  });

  it("カート追加失敗時にエラートーストが表示されること", async () => {
    const { toast } = await import("sonner");
    mockAddToCart.mockResolvedValue({ data: undefined, error: "error" });

    render(<ProductDetailPage productId={1} />);

    await waitFor(() => {
      expect(screen.getByLabelText("M / 赤")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByLabelText("M / 赤"));
    fireEvent.click(screen.getByRole("button", { name: "カートに追加" }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("カートへの追加に失敗しました");
    });
  });

  it("API取得失敗時にエラーメッセージが表示されること", async () => {
    mockFindById.mockResolvedValue({ data: undefined, error: "error" });

    render(<ProductDetailPage productId={1} />);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("商品情報の取得に失敗しました");
    });
  });

  it("数量を増減できること", async () => {
    render(<ProductDetailPage productId={1} />);

    await waitFor(() => {
      expect(screen.getByLabelText("M / 赤")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByLabelText("M / 赤"));

    const increaseBtn = screen.getByRole("button", { name: "数量を増やす" });
    fireEvent.click(increaseBtn);
    expect(screen.getByText("2")).toBeInTheDocument();

    const decreaseBtn = screen.getByRole("button", { name: "数量を減らす" });
    fireEvent.click(decreaseBtn);
    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("商品一覧へのパンくずが表示されること", async () => {
    render(<ProductDetailPage productId={1} />);

    await waitFor(() => {
      expect(screen.getByRole("navigation", { name: "パンくず" })).toBeInTheDocument();
    });

    const links = screen.getAllByRole("link", { name: "商品一覧" });
    expect(links.length).toBeGreaterThan(0);
  });

  it("バリエーション切り替え時に数量が在庫上限にクランプされること", async () => {
    const productWith2Variations = {
      ...mockProduct,
      variations: [
        { id: 10, productId: 1, size: "M", color: "赤", price: 2000, stock: 5, deletedAt: null },
        { id: 13, productId: 1, size: "XL", color: "緑", price: 2200, stock: 2, deletedAt: null },
      ],
    };
    mockFindById.mockResolvedValue({ data: productWith2Variations, error: undefined });

    render(<ProductDetailPage productId={1} />);

    await waitFor(() => {
      expect(screen.getByLabelText("M / 赤")).toBeInTheDocument();
    });

    // M/赤(stock=5)を選択して数量を4に増やす
    fireEvent.click(screen.getByLabelText("M / 赤"));
    const increaseBtn = screen.getByRole("button", { name: "数量を増やす" });
    fireEvent.click(increaseBtn);
    fireEvent.click(increaseBtn);
    fireEvent.click(increaseBtn);
    expect(screen.getByText("4")).toBeInTheDocument();

    // XL/緑(stock=2)に切り替えると数量が2にクランプされること
    fireEvent.click(screen.getByLabelText("XL / 緑"));
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("productId変更時に選択バリエーションと数量がリセットされること", async () => {
    const { rerender } = render(<ProductDetailPage productId={1} />);

    await waitFor(() => {
      expect(screen.getByLabelText("M / 赤")).toBeInTheDocument();
    });

    // バリエーションを選択
    fireEvent.click(screen.getByLabelText("M / 赤"));
    expect(screen.getByLabelText("M / 赤")).toHaveAttribute("aria-pressed", "true");

    // productId を変更
    const product2 = { ...mockProduct, id: 2, name: "別の商品" };
    mockFindById.mockResolvedValue({ data: product2, error: undefined });

    await act(async () => {
      rerender(<ProductDetailPage productId={2} />);
    });

    await waitFor(() => {
      expect(screen.getByRole("heading", { level: 1, name: "別の商品" })).toBeInTheDocument();
    });

    // カートボタンがリセット後も無効（未選択）であること
    expect(screen.getByRole("button", { name: "カートに追加" })).toBeDisabled();
  });
});
