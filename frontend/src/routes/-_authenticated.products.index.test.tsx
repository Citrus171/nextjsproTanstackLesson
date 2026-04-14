import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ProductsPage } from "@/components/pages/ProductsPage";

// ── モック ──────────────────────────────────────────────────────────────────

const mockFindAll = vi.fn();
const mockFindAllCategories = vi.fn();

vi.mock("@/api/generated/sdk.gen", () => ({
  publicProductsControllerFindAll: (...args: unknown[]) => mockFindAll(...args),
  categoriesControllerFindAll: (...args: unknown[]) =>
    mockFindAllCategories(...args),
}));

vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => vi.fn(),
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
}));

// ── テストデータ ─────────────────────────────────────────────────────────────

const mockProducts = [
  {
    id: 1,
    name: "テストシャツ",
    description: "テスト説明",
    price: 2000,
    category: { id: 1, name: "衣類" },
    images: [{ id: 1, url: "https://example.com/shirt.jpg", sortOrder: 0 }],
    variations: [{ id: 10, size: "M", color: "赤", price: 2000, stock: 5 }],
  },
  {
    id: 2,
    name: "テストパンツ",
    description: null,
    price: 3000,
    category: null,
    images: [],
    variations: [{ id: 20, size: "L", color: "青", price: 3000, stock: 0 }],
  },
];

const mockCategories = [
  { id: 1, name: "衣類", parentId: null, children: [], createdAt: "2026-01-01T00:00:00Z" },
  { id: 2, name: "小物", parentId: null, children: [], createdAt: "2026-01-02T00:00:00Z" },
];

const successResponse = {
  data: { data: mockProducts, total: 2 },
  error: undefined,
};

const categoriesResponse = {
  data: mockCategories,
  error: undefined,
};

// ── テスト ───────────────────────────────────────────────────────────────────

describe("ProductsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFindAll.mockResolvedValue(successResponse);
    mockFindAllCategories.mockResolvedValue(categoriesResponse);
  });

  // ── 一覧表示 ────────────────────────────────────────────────────────────

  it("商品名・価格・カテゴリが表示されること", async () => {
    render(<ProductsPage />);

    await waitFor(() => {
      expect(screen.getByText("テストシャツ")).toBeInTheDocument();
    });

    expect(screen.getByText("テストパンツ")).toBeInTheDocument();
    expect(screen.getByText("¥2,000")).toBeInTheDocument();
    expect(screen.getByText("¥3,000")).toBeInTheDocument();
    // カテゴリ名は商品カードとドロップダウン両方に表示される
    expect(screen.getAllByText("衣類").length).toBeGreaterThan(0);
  });

  it("API取得失敗時にエラーメッセージが表示されること", async () => {
    mockFindAll.mockResolvedValue({ data: undefined, error: "server error" });

    render(<ProductsPage />);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(
        "商品一覧の取得に失敗しました",
      );
    });
  });

  it("ローディング中は読み込み中テキストが表示されること", async () => {
    mockFindAll.mockReturnValue(new Promise(() => {}));

    render(<ProductsPage />);

    expect(screen.getByText("読み込み中...")).toBeInTheDocument();
  });

  // ── キーワード検索 ───────────────────────────────────────────────────────

  it("キーワード入力時に検索パラメータ付きでAPIが呼ばれること", async () => {
    const user = userEvent.setup();
    render(<ProductsPage />);

    await waitFor(() =>
      expect(screen.getByText("テストシャツ")).toBeInTheDocument(),
    );

    const searchInput = screen.getByPlaceholderText("商品を検索");
    await user.type(searchInput, "シャツ");
    fireEvent.click(screen.getByRole("button", { name: "検索" }));

    await waitFor(() => {
      const calls = mockFindAll.mock.calls;
      const lastCall = calls[calls.length - 1][0];
      expect(lastCall.query).toMatchObject({ keyword: "シャツ" });
    });
  });

  // ── カテゴリフィルタ ─────────────────────────────────────────────────────

  it("カテゴリセレクトが表示されること", async () => {
    render(<ProductsPage />);

    await waitFor(() =>
      expect(screen.getByText("テストシャツ")).toBeInTheDocument(),
    );

    const categorySelect = screen.getByRole("combobox", { name: /カテゴリ/ });
    expect(categorySelect).toBeInTheDocument();
    // セレクト内にカテゴリオプションが含まれていること
    expect(categorySelect.querySelector('option[value="1"]')).toHaveTextContent("衣類");
    expect(categorySelect.querySelector('option[value="2"]')).toHaveTextContent("小物");
  });

  it("カテゴリ選択時にcategory_idパラメータ付きでAPIが呼ばれること", async () => {
    render(<ProductsPage />);

    await waitFor(() =>
      expect(screen.getByText("テストシャツ")).toBeInTheDocument(),
    );

    const categorySelect = screen.getByRole("combobox", { name: /カテゴリ/ });
    fireEvent.change(categorySelect, { target: { value: "1" } });

    await waitFor(() => {
      const calls = mockFindAll.mock.calls;
      const lastCall = calls[calls.length - 1][0];
      expect(lastCall.query).toMatchObject({ category_id: 1 });
    });
  });

  // ── ソート ──────────────────────────────────────────────────────────────

  it("ソートセレクトが表示されること", async () => {
    render(<ProductsPage />);

    await waitFor(() =>
      expect(screen.getByText("テストシャツ")).toBeInTheDocument(),
    );

    expect(
      screen.getByRole("combobox", { name: /並び替え/ }),
    ).toBeInTheDocument();
  });

  it("ソート変更時にsortパラメータ付きでAPIが呼ばれること", async () => {
    render(<ProductsPage />);

    await waitFor(() =>
      expect(screen.getByText("テストシャツ")).toBeInTheDocument(),
    );

    const sortSelect = screen.getByRole("combobox", { name: /並び替え/ });
    fireEvent.change(sortSelect, { target: { value: "price_asc" } });

    await waitFor(() => {
      const calls = mockFindAll.mock.calls;
      const lastCall = calls[calls.length - 1][0];
      expect(lastCall.query).toMatchObject({ sort: "price_asc" });
    });
  });

  // ── 商品詳細リンク ───────────────────────────────────────────────────────

  it("商品名をクリックすると詳細ページへのリンクになっていること", async () => {
    render(<ProductsPage />);

    await waitFor(() =>
      expect(screen.getByText("テストシャツ")).toBeInTheDocument(),
    );

    const productLink = screen.getByRole("link", { name: "テストシャツ" });
    expect(productLink).toHaveAttribute("href", "/products/1");
  });

  // ── データ形式エラー ──────────────────────────────────────────────────────

  it("APIが不正な形式のデータを返した場合にエラーメッセージが表示されること", async () => {
    // スキーマ（{data:[...], total:N}）に合わない不正なデータを返す
    mockFindAll.mockResolvedValue({ data: { invalid: "format" }, error: undefined });

    render(<ProductsPage />);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(
        "商品データの形式が不正です",
      );
    });
  });
});
