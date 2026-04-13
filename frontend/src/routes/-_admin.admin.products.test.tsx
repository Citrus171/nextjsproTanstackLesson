import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { AdminProductsPage } from "@/components/pages/AdminProductsPage";

// ── モック ──────────────────────────────────────────────────────────────────

const mockFindAll = vi.fn();
const mockCreate = vi.fn();
const mockUpdate = vi.fn();
const mockDelete = vi.fn();
const mockPublish = vi.fn();
const mockUnpublish = vi.fn();
const mockAddVariation = vi.fn();
const mockDeleteVariation = vi.fn();

vi.mock("@/api/generated/sdk.gen", () => ({
  productsControllerFindAll: (...args: unknown[]) => mockFindAll(...args),
  productsControllerCreate: (...args: unknown[]) => mockCreate(...args),
  productsControllerUpdate: (...args: unknown[]) => mockUpdate(...args),
  productsControllerDelete: (...args: unknown[]) => mockDelete(...args),
  productsControllerPublish: (...args: unknown[]) => mockPublish(...args),
  productsControllerUnpublish: (...args: unknown[]) => mockUnpublish(...args),
  productsControllerAddVariation: (...args: unknown[]) => mockAddVariation(...args),
  productsControllerDeleteVariation: (...args: unknown[]) => mockDeleteVariation(...args),
}));

vi.mock("@/lib/auth", () => ({
  getAdminToken: () => "test-admin-token",
}));

// ── テストデータ ─────────────────────────────────────────────────────────────

const mockProduct = {
  id: 1,
  name: "テストシャツ",
  description: "テスト用の説明",
  price: 2000,
  categoryId: null,
  isPublished: true,
  createdAt: "2026-04-01T00:00:00Z",
  updatedAt: "2026-04-01T00:00:00Z",
  variations: [
    { id: 10, productId: 1, size: "M", color: "赤", price: 2000, stock: 5 },
  ],
};

const mockProductUnpublished = {
  ...mockProduct,
  id: 2,
  name: "非公開商品",
  isPublished: false,
  variations: [],
};

const successResponse = { data: { data: [mockProduct, mockProductUnpublished], total: 2 }, error: undefined };

// ── テスト ───────────────────────────────────────────────────────────────────

describe("AdminProductsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // window.confirm は全テストでデフォルトtrue
    vi.spyOn(window, "confirm").mockReturnValue(true);
    mockFindAll.mockResolvedValue(successResponse);
  });

  // ── 一覧表示 ────────────────────────────────────────────────────────────

  it("商品一覧が表示されること", async () => {
    render(<AdminProductsPage />);

    await waitFor(() => {
      expect(screen.getByText("テストシャツ")).toBeInTheDocument();
    });

    expect(screen.getByText("非公開商品")).toBeInTheDocument();
    expect(screen.getByText("全2件")).toBeInTheDocument();
  });

  it("公開状態がラベルで表示されること", async () => {
    render(<AdminProductsPage />);

    await waitFor(() => {
      expect(screen.getByText("テストシャツ")).toBeInTheDocument();
    });

    expect(screen.getAllByText("公開")[0]).toBeInTheDocument();
    expect(screen.getByText("非公開")).toBeInTheDocument();
  });

  it("API取得失敗時にエラーメッセージが表示されること", async () => {
    mockFindAll.mockResolvedValue({ data: undefined, error: "server error" });

    render(<AdminProductsPage />);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("商品一覧の取得に失敗しました");
    });
  });

  // ── 商品登録 ────────────────────────────────────────────────────────────

  it("「商品登録」ボタンをクリックするとフォームが表示されること", async () => {
    render(<AdminProductsPage />);
    await waitFor(() => expect(screen.getByText("テストシャツ")).toBeInTheDocument());

    fireEvent.click(screen.getByRole("button", { name: "商品登録" }));

    expect(screen.getByRole("form", { name: "商品登録フォーム" })).toBeInTheDocument();
  });

  it("商品登録フォームを送信すると登録APIが呼ばれること", async () => {
    const user = userEvent.setup();
    mockCreate.mockResolvedValue({ data: { id: 3 }, error: undefined });

    render(<AdminProductsPage />);
    await waitFor(() => expect(screen.getByText("テストシャツ")).toBeInTheDocument());

    fireEvent.click(screen.getByRole("button", { name: "商品登録" }));

    await user.type(screen.getByLabelText(/商品名/), "新商品");
    await user.type(screen.getByLabelText(/価格/), "1500");
    fireEvent.click(screen.getByRole("button", { name: "登録する" }));

    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          body: expect.objectContaining({ name: "新商品", price: 1500 }),
        }),
      );
    });

    await waitFor(() => {
      expect(screen.getByRole("status")).toHaveTextContent("商品を登録しました");
    });
  });

  it("商品登録失敗時にエラーメッセージが表示されること", async () => {
    const user = userEvent.setup();
    mockCreate.mockResolvedValue({ data: undefined, error: "error" });

    render(<AdminProductsPage />);
    await waitFor(() => expect(screen.getByText("テストシャツ")).toBeInTheDocument());

    fireEvent.click(screen.getByRole("button", { name: "商品登録" }));
    await user.type(screen.getByLabelText(/商品名/), "失敗商品");
    await user.type(screen.getByLabelText(/価格/), "1000");
    fireEvent.click(screen.getByRole("button", { name: "登録する" }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("商品の登録に失敗しました");
    });
  });

  // ── 商品編集 ────────────────────────────────────────────────────────────

  it("「編集」ボタンをクリックすると編集フォームが表示されること", async () => {
    render(<AdminProductsPage />);
    await waitFor(() => expect(screen.getByText("テストシャツ")).toBeInTheDocument());

    fireEvent.click(screen.getAllByRole("button", { name: "編集" })[0]);

    expect(screen.getByRole("form", { name: "商品編集フォーム" })).toBeInTheDocument();
    expect(screen.getByDisplayValue("テストシャツ")).toBeInTheDocument();
    expect(screen.getByDisplayValue("2000")).toBeInTheDocument();
  });

  it("編集フォームを送信すると更新APIが呼ばれること", async () => {
    const user = userEvent.setup();
    mockUpdate.mockResolvedValue({ data: {}, error: undefined });

    render(<AdminProductsPage />);
    await waitFor(() => expect(screen.getByText("テストシャツ")).toBeInTheDocument());

    fireEvent.click(screen.getAllByRole("button", { name: "編集" })[0]);

    const nameInput = screen.getByDisplayValue("テストシャツ");
    await user.clear(nameInput);
    await user.type(nameInput, "更新後シャツ");
    fireEvent.click(screen.getByRole("button", { name: "更新する" }));

    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          path: { id: 1 },
          body: expect.objectContaining({ name: "更新後シャツ" }),
        }),
      );
    });

    await waitFor(() => {
      expect(screen.getByRole("status")).toHaveTextContent("商品を更新しました");
    });
  });

  // ── 商品削除 ────────────────────────────────────────────────────────────

  it("「削除」ボタンをクリックして確認するとAPIが呼ばれること", async () => {
    mockDelete.mockResolvedValue({ data: {}, error: undefined });

    render(<AdminProductsPage />);
    await waitFor(() => expect(screen.getByText("テストシャツ")).toBeInTheDocument());

    fireEvent.click(screen.getAllByRole("button", { name: "削除" })[0]);

    await waitFor(() => {
      expect(mockDelete).toHaveBeenCalledWith(
        expect.objectContaining({ path: { id: 1 } }),
      );
    });

    await waitFor(() => {
      expect(screen.getByRole("status")).toHaveTextContent("商品を削除しました");
    });
  });

  it("削除確認でキャンセルするとAPIが呼ばれないこと", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(false);

    render(<AdminProductsPage />);
    await waitFor(() => expect(screen.getByText("テストシャツ")).toBeInTheDocument());

    fireEvent.click(screen.getAllByRole("button", { name: "削除" })[0]);

    expect(mockDelete).not.toHaveBeenCalled();
  });

  // ── 公開切り替え ─────────────────────────────────────────────────────────

  it("「公開する」ボタンをクリックすると公開APIが呼ばれること", async () => {
    mockPublish.mockResolvedValue({ data: {}, error: undefined });

    render(<AdminProductsPage />);
    await waitFor(() => expect(screen.getByText("非公開商品")).toBeInTheDocument());

    fireEvent.click(screen.getByRole("button", { name: "公開する" }));

    await waitFor(() => {
      expect(mockPublish).toHaveBeenCalledWith(
        expect.objectContaining({ path: { id: 2 } }),
      );
    });

    await waitFor(() => {
      expect(screen.getByRole("status")).toHaveTextContent("公開しました");
    });
  });

  it("「非公開にする」ボタンをクリックすると非公開APIが呼ばれること", async () => {
    mockUnpublish.mockResolvedValue({ data: {}, error: undefined });

    render(<AdminProductsPage />);
    await waitFor(() => expect(screen.getByText("テストシャツ")).toBeInTheDocument());

    fireEvent.click(screen.getByRole("button", { name: "非公開にする" }));

    await waitFor(() => {
      expect(mockUnpublish).toHaveBeenCalledWith(
        expect.objectContaining({ path: { id: 1 } }),
      );
    });

    await waitFor(() => {
      expect(screen.getByRole("status")).toHaveTextContent("非公開にしました");
    });
  });

  // ── バリエーション ───────────────────────────────────────────────────────

  it("「バリエーション」ボタンをクリックするとバリエーション一覧が表示されること", async () => {
    render(<AdminProductsPage />);
    await waitFor(() => expect(screen.getByText("テストシャツ")).toBeInTheDocument());

    fireEvent.click(screen.getAllByRole("button", { name: "バリエーション" })[0]);

    await waitFor(() => {
      expect(screen.getByText("M")).toBeInTheDocument();
      expect(screen.getByText("赤")).toBeInTheDocument();
    });
  });

  it("バリエーション追加フォームを送信するとAPIが呼ばれること", async () => {
    const user = userEvent.setup();
    mockAddVariation.mockResolvedValue({ data: {}, error: undefined });

    render(<AdminProductsPage />);
    await waitFor(() => expect(screen.getByText("テストシャツ")).toBeInTheDocument());

    fireEvent.click(screen.getAllByRole("button", { name: "バリエーション" })[0]);
    fireEvent.click(screen.getByRole("button", { name: "バリエーション追加" }));

    await user.type(screen.getByLabelText(/サイズ/), "L");
    await user.type(screen.getByLabelText(/カラー/), "青");
    await user.type(screen.getByLabelText(/価格/), "2500");
    await user.type(screen.getByLabelText(/在庫数/), "20");
    fireEvent.click(screen.getByRole("button", { name: "追加する" }));

    await waitFor(() => {
      expect(mockAddVariation).toHaveBeenCalledWith(
        expect.objectContaining({
          path: { id: 1 },
          body: expect.objectContaining({ size: "L", color: "青", price: 2500, stock: 20 }),
        }),
      );
    });

    await waitFor(() => {
      expect(screen.getByRole("status")).toHaveTextContent("バリエーションを追加しました");
    });
  });

  it("バリエーション削除ボタンをクリックするとAPIが呼ばれること", async () => {
    mockDeleteVariation.mockResolvedValue({ data: {}, error: undefined });

    render(<AdminProductsPage />);
    await waitFor(() => expect(screen.getByText("テストシャツ")).toBeInTheDocument());

    fireEvent.click(screen.getAllByRole("button", { name: "バリエーション" })[0]);
    await waitFor(() => expect(screen.getByText("M")).toBeInTheDocument());

    // 削除ボタン: [0]=商品1削除, [1]=バリエーション削除, [2]=商品2削除
    const deleteButtons = screen.getAllByRole("button", { name: "削除" });
    fireEvent.click(deleteButtons[1]);

    await waitFor(() => {
      expect(mockDeleteVariation).toHaveBeenCalledWith(
        expect.objectContaining({ path: { variationId: 10 } }),
      );
    });
  });
});
