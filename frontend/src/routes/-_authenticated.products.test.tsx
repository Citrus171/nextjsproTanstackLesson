import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ProductsPage } from "@/components/pages/ProductsPage";

const mockFindAll = vi.fn();

vi.mock("@/api/generated/sdk.gen", () => ({
  publicProductsControllerFindAll: (...args: unknown[]) => mockFindAll(...args),
  publicProductsControllerFindById: vi.fn(),
  cartsControllerAddToCart: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  isAuthenticated: () => true,
  getToken: () => "test-token",
}));

const mockProducts = [
  {
    id: 1,
    name: "テストシャツ",
    description: "テスト用",
    price: 2000,
    categoryId: 1,
    images: [],
    variations: [{ id: 10, productId: 1, size: "M", color: "赤", price: 2000, stock: 5 }],
    category: { id: 1, name: "衣類" },
  },
  {
    id: 2,
    name: "テストパンツ",
    description: null,
    price: 5000,
    categoryId: 1,
    images: [],
    variations: [],
    category: { id: 1, name: "衣類" },
  },
];

describe("ProductsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFindAll.mockResolvedValue({
      data: { data: mockProducts, total: 2 },
      error: undefined,
    });
  });

  it("商品一覧が表示されること", async () => {
    render(<ProductsPage />);

    await waitFor(() => {
      expect(screen.getByText("テストシャツ")).toBeInTheDocument();
    });

    expect(screen.getByText("テストパンツ")).toBeInTheDocument();
    expect(screen.getByText("全2件")).toBeInTheDocument();
  });

  it("商品価格が表示されること", async () => {
    render(<ProductsPage />);

    await waitFor(() => {
      expect(screen.getByText("¥2,000")).toBeInTheDocument();
    });

    expect(screen.getByText("¥5,000")).toBeInTheDocument();
  });

  it("カテゴリ名が表示されること", async () => {
    render(<ProductsPage />);

    await waitFor(() => {
      expect(screen.getAllByText("衣類").length).toBeGreaterThan(0);
    });
  });

  it("API取得失敗時にエラーメッセージが表示されること", async () => {
    mockFindAll.mockResolvedValue({ data: undefined, error: "error" });

    render(<ProductsPage />);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("商品一覧の取得に失敗しました");
    });
  });

  it("検索フォームを送信するとAPIが呼ばれること", async () => {
    render(<ProductsPage />);
    await waitFor(() => expect(screen.getByText("テストシャツ")).toBeInTheDocument());

    const input = screen.getByRole("textbox", { name: "キーワード検索" });
    fireEvent.change(input, { target: { value: "シャツ" } });
    fireEvent.submit(input.closest("form")!);

    await waitFor(() => {
      expect(mockFindAll).toHaveBeenCalledTimes(2);
      expect(mockFindAll).toHaveBeenLastCalledWith(
        expect.objectContaining({
          query: expect.objectContaining({ keyword: "シャツ" }),
        }),
      );
    });
  });

  it("並び替え変更するとAPIが呼ばれること", async () => {
    render(<ProductsPage />);
    await waitFor(() => expect(screen.getByText("テストシャツ")).toBeInTheDocument());

    fireEvent.change(screen.getByRole("combobox", { name: "並び替え" }), {
      target: { value: "price_asc" },
    });

    await waitFor(() => {
      expect(mockFindAll).toHaveBeenLastCalledWith(
        expect.objectContaining({
          query: expect.objectContaining({ sort: "price_asc" }),
        }),
      );
    });
  });

  it("商品が0件の時「見つかりませんでした」が表示されること", async () => {
    mockFindAll.mockResolvedValue({ data: { data: [], total: 0 }, error: undefined });

    render(<ProductsPage />);

    await waitFor(() => {
      expect(screen.getByText("商品が見つかりませんでした")).toBeInTheDocument();
    });
  });
});
