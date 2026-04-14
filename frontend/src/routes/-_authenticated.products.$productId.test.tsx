import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ProductDetailPage } from "@/components/pages/ProductDetailPage";

// ── モック ──────────────────────────────────────────────────────────────────

const mockFindById = vi.fn();
const mockAddToCart = vi.fn();

vi.mock("@/api/generated/sdk.gen", () => ({
  publicProductsControllerFindById: (...args: unknown[]) =>
    mockFindById(...args),
  cartsControllerAddToCart: (...args: unknown[]) => mockAddToCart(...args),
}));

vi.mock("@tanstack/react-router", () => ({
  useParams: () => ({ productId: "1" }),
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
}));

vi.mock("@/lib/auth", () => ({
  getToken: () => "test-token",
}));

// ── テストデータ ─────────────────────────────────────────────────────────────

const mockProduct = {
  id: 1,
  name: "テストシャツ",
  description: "これはテスト用の説明文です。",
  price: 2000,
  category: { id: 1, name: "衣類" },
  images: [
    { id: 1, url: "https://example.com/shirt1.jpg", sortOrder: 0 },
    { id: 2, url: "https://example.com/shirt2.jpg", sortOrder: 1 },
  ],
  variations: [
    { id: 10, size: "S", color: "赤", price: 2000, stock: 3 },
    { id: 11, size: "M", color: "赤", price: 2000, stock: 0 },
    { id: 12, size: "L", color: "青", price: 2500, stock: 5 },
  ],
};

const successResponse = { data: mockProduct, error: undefined };

// ── テスト ───────────────────────────────────────────────────────────────────

describe("ProductDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFindById.mockResolvedValue(successResponse);
  });

  // ── 詳細表示 ────────────────────────────────────────────────────────────

  it("商品名・価格・説明が表示されること", async () => {
    render(<ProductDetailPage />);

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "テストシャツ" }),
      ).toBeInTheDocument();
    });

    expect(
      screen.getByText("これはテスト用の説明文です。"),
    ).toBeInTheDocument();
    expect(screen.getByText("¥2,000")).toBeInTheDocument();
    expect(screen.getByText("衣類")).toBeInTheDocument();
  });

  it("商品画像が表示されること", async () => {
    render(<ProductDetailPage />);

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "テストシャツ" }),
      ).toBeInTheDocument();
    });

    const images = screen.getAllByRole("img");
    expect(images.length).toBeGreaterThan(0);
  });

  it("API取得失敗時にエラーメッセージが表示されること", async () => {
    mockFindById.mockResolvedValue({ data: undefined, error: "not found" });

    render(<ProductDetailPage />);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(
        "商品の取得に失敗しました",
      );
    });
  });

  // ── バリエーション選択 ───────────────────────────────────────────────────

  it("バリエーション一覧が選択肢として表示されること", async () => {
    render(<ProductDetailPage />);

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "テストシャツ" }),
      ).toBeInTheDocument();
    });

    const variationSelect = screen.getByRole("combobox", {
      name: /バリエーション/,
    });
    expect(variationSelect).toBeInTheDocument();
    expect(variationSelect.querySelector('option[value="10"]')).toHaveTextContent("S / 赤");
    expect(variationSelect.querySelector('option[value="12"]')).toHaveTextContent("L / 青");
  });

  it("在庫0のバリエーションは無効化されていること", async () => {
    render(<ProductDetailPage />);

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "テストシャツ" }),
      ).toBeInTheDocument();
    });

    const variationSelect = screen.getByRole("combobox", {
      name: /バリエーション/,
    });
    const outOfStockOption = variationSelect.querySelector('option[value="11"]');
    expect(outOfStockOption).toBeDisabled();
  });

  // ── 数量選択 ────────────────────────────────────────────────────────────

  it("数量入力フィールドが表示されること", async () => {
    render(<ProductDetailPage />);

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "テストシャツ" }),
      ).toBeInTheDocument();
    });

    expect(screen.getByRole("spinbutton", { name: /数量/ })).toBeInTheDocument();
  });

  // ── カートに追加 ──────────────────────────────────────────────────────

  it("バリエーションを選択してカートに追加するとAPIが呼ばれること", async () => {
    const user = userEvent.setup();
    mockAddToCart.mockResolvedValue({ data: {}, error: undefined });

    render(<ProductDetailPage />);

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "テストシャツ" }),
      ).toBeInTheDocument();
    });

    // バリエーション選択
    const variationSelect = screen.getByRole("combobox", {
      name: /バリエーション/,
    });
    await user.selectOptions(variationSelect, "10");

    // カートに追加
    fireEvent.click(screen.getByRole("button", { name: "カートに追加" }));

    await waitFor(() => {
      expect(mockAddToCart).toHaveBeenCalledWith(
        expect.objectContaining({
          body: expect.objectContaining({ variationId: 10, quantity: 1 }),
        }),
      );
    });

    await waitFor(() => {
      expect(screen.getByRole("status")).toHaveTextContent(
        "カートに追加しました",
      );
    });
  });

  it("バリエーション未選択時はカートボタンが無効化されていること", async () => {
    render(<ProductDetailPage />);

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "テストシャツ" }),
      ).toBeInTheDocument();
    });

    expect(
      screen.getByRole("button", { name: "カートに追加" }),
    ).toBeDisabled();
    expect(mockAddToCart).not.toHaveBeenCalled();
  });

  it("バリエーション選択時に数量が在庫上限にクランプされること", async () => {
    const user = userEvent.setup();
    render(<ProductDetailPage />);

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "テストシャツ" }),
      ).toBeInTheDocument();
    });

    const quantityInput = screen.getByRole("spinbutton", { name: /数量/ });
    const variationSelect = screen.getByRole("combobox", {
      name: /バリエーション/,
    });

    // 数量を5に増やしてから stock=3 のバリエーションを選択
    fireEvent.change(quantityInput, { target: { value: "5" } });
    await user.selectOptions(variationSelect, "10");

    // 在庫(3)にクランプされること
    expect(quantityInput).toHaveValue(3);
  });

  it("数量が在庫を超えているとカートボタンが無効化されること", async () => {
    const user = userEvent.setup();
    render(<ProductDetailPage />);

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "テストシャツ" }),
      ).toBeInTheDocument();
    });

    const variationSelect = screen.getByRole("combobox", {
      name: /バリエーション/,
    });
    const quantityInput = screen.getByRole("spinbutton", { name: /数量/ });

    // stock=3 のバリエーションを選択してから数量を在庫超えに設定
    await user.selectOptions(variationSelect, "10");
    fireEvent.change(quantityInput, { target: { value: "10" } });

    expect(
      screen.getByRole("button", { name: "カートに追加" }),
    ).toBeDisabled();
  });

  it("カート追加失敗時にエラーメッセージが表示されること", async () => {
    const user = userEvent.setup();
    mockAddToCart.mockResolvedValue({ data: undefined, error: "error" });

    render(<ProductDetailPage />);

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "テストシャツ" }),
      ).toBeInTheDocument();
    });

    const variationSelect = screen.getByRole("combobox", {
      name: /バリエーション/,
    });
    await user.selectOptions(variationSelect, "10");
    fireEvent.click(screen.getByRole("button", { name: "カートに追加" }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(
        "カートへの追加に失敗しました",
      );
    });
  });
});
