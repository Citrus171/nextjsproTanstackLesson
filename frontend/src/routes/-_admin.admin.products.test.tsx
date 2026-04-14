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
const mockAddImage = vi.fn();
const mockDeleteImage = vi.fn();
const mockFindAllCategories = vi.fn();

vi.mock("@/api/generated/sdk.gen", () => ({
  productsControllerFindAll: (...args: unknown[]) => mockFindAll(...args),
  productsControllerCreate: (...args: unknown[]) => mockCreate(...args),
  productsControllerUpdate: (...args: unknown[]) => mockUpdate(...args),
  productsControllerDelete: (...args: unknown[]) => mockDelete(...args),
  productsControllerPublish: (...args: unknown[]) => mockPublish(...args),
  productsControllerUnpublish: (...args: unknown[]) => mockUnpublish(...args),
  productsControllerAddVariation: (...args: unknown[]) => mockAddVariation(...args),
  productsControllerDeleteVariation: (...args: unknown[]) => mockDeleteVariation(...args),
  productsControllerAddImage: (...args: unknown[]) => mockAddImage(...args),
  productsControllerDeleteImage: (...args: unknown[]) => mockDeleteImage(...args),
  adminCategoriesControllerFindAll: (...args: unknown[]) => mockFindAllCategories(...args),
}));

vi.mock("@/lib/auth", () => ({
  getAdminToken: () => "test-admin-token",
}));

// ── テストデータ ─────────────────────────────────────────────────────────────

const mockCategories = [
  { id: 1, name: "衣類", parentId: null },
  { id: 2, name: "小物", parentId: null },
];

const mockProduct = {
  id: 1,
  name: "テストシャツ",
  description: "テスト用の説明",
  price: 2000,
  categoryId: 1,
  isPublished: true,
  createdAt: "2026-04-01T00:00:00Z",
  updatedAt: "2026-04-01T00:00:00Z",
  images: [
    { id: 100, url: "https://example.com/img1.jpg", sortOrder: 0 },
  ],
  variations: [
    { id: 10, productId: 1, size: "M", color: "赤", price: 2000, stock: 5 },
  ],
};

const mockProductUnpublished = {
  ...mockProduct,
  id: 2,
  name: "非公開商品",
  isPublished: false,
  images: [],
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
    mockFindAllCategories.mockResolvedValue({
      data: mockCategories,
      error: undefined,
    });
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

  // ── カテゴリ選択 ──────────────────────────────────────────────────────

  it("商品登録フォームにカテゴリ選択肢が表示されること", async () => {
    render(<AdminProductsPage />);
    await waitFor(() => expect(screen.getByText("テストシャツ")).toBeInTheDocument());

    fireEvent.click(screen.getByRole("button", { name: "商品登録" }));

    await waitFor(() => {
      const categorySelect = screen.getByRole("combobox", { name: /カテゴリ/ });
      expect(categorySelect).toBeInTheDocument();
      expect(categorySelect.querySelector('option[value="1"]')).toHaveTextContent("衣類");
      expect(categorySelect.querySelector('option[value="2"]')).toHaveTextContent("小物");
    });
  });

  it("商品登録フォームでカテゴリを選択して登録するとAPIにcategoryIdが渡されること", async () => {
    const user = userEvent.setup();
    mockCreate.mockResolvedValue({ data: { id: 3 }, error: undefined });

    render(<AdminProductsPage />);
    await waitFor(() => expect(screen.getByText("テストシャツ")).toBeInTheDocument());

    fireEvent.click(screen.getByRole("button", { name: "商品登録" }));
    await user.type(screen.getByLabelText(/商品名/), "新商品");
    await user.type(screen.getByLabelText(/価格/), "1500");

    const categorySelect = screen.getByRole("combobox", { name: /カテゴリ/ });
    await user.selectOptions(categorySelect, "1");

    fireEvent.click(screen.getByRole("button", { name: "登録する" }));

    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          body: expect.objectContaining({ categoryId: 1 }),
        }),
      );
    });
  });

  it("商品編集フォームにカテゴリ選択肢が表示されること", async () => {
    render(<AdminProductsPage />);
    await waitFor(() => expect(screen.getByText("テストシャツ")).toBeInTheDocument());

    fireEvent.click(screen.getAllByRole("button", { name: "編集" })[0]);

    const categorySelect = screen.getByRole("combobox", { name: /カテゴリ/ });
    expect(categorySelect).toBeInTheDocument();
    // 既存のcategoryId(1)が選択されていること
    expect(categorySelect).toHaveValue("1");
  });

  // ── 公開状態 ──────────────────────────────────────────────────────────

  it("商品登録フォームに公開状態チェックボックスが表示されること", async () => {
    render(<AdminProductsPage />);
    await waitFor(() => expect(screen.getByText("テストシャツ")).toBeInTheDocument());

    fireEvent.click(screen.getByRole("button", { name: "商品登録" }));

    expect(
      screen.getByRole("checkbox", { name: /登録後すぐに公開/ }),
    ).toBeInTheDocument();
  });

  it("公開チェックをオンにして登録するとAPIにisPublished:trueが渡されること", async () => {
    const user = userEvent.setup();
    mockCreate.mockResolvedValue({ data: { id: 3 }, error: undefined });
    mockPublish.mockResolvedValue({ data: {}, error: undefined });

    render(<AdminProductsPage />);
    await waitFor(() => expect(screen.getByText("テストシャツ")).toBeInTheDocument());

    fireEvent.click(screen.getByRole("button", { name: "商品登録" }));
    await user.type(screen.getByLabelText(/商品名/), "公開商品");
    await user.type(screen.getByLabelText(/価格/), "2000");

    const publishCheckbox = screen.getByRole("checkbox", { name: /登録後すぐに公開/ });
    await user.click(publishCheckbox);

    fireEvent.click(screen.getByRole("button", { name: "登録する" }));

    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          body: expect.objectContaining({ isPublished: true }),
        }),
      );
    });
  });

  // ── 画像管理 ──────────────────────────────────────────────────────────

  it("画像管理ボタンをクリックすると画像セクションが表示されること", async () => {
    render(<AdminProductsPage />);
    await waitFor(() => expect(screen.getByText("テストシャツ")).toBeInTheDocument());

    fireEvent.click(screen.getAllByRole("button", { name: "画像" })[0]);

    await waitFor(() => {
      expect(screen.getByRole("form", { name: "画像追加フォーム" })).toBeInTheDocument();
    });
  });

  it("画像URLを入力して追加するとAPIが呼ばれること", async () => {
    const user = userEvent.setup();
    mockAddImage.mockResolvedValue({ data: { id: 200 }, error: undefined });

    render(<AdminProductsPage />);
    await waitFor(() => expect(screen.getByText("テストシャツ")).toBeInTheDocument());

    fireEvent.click(screen.getAllByRole("button", { name: "画像" })[0]);

    await waitFor(() => {
      expect(screen.getByRole("form", { name: "画像追加フォーム" })).toBeInTheDocument();
    });

    await user.type(
      screen.getByPlaceholderText("https://example.com/image.jpg"),
      "https://example.com/new.jpg",
    );
    fireEvent.click(screen.getByRole("button", { name: "画像追加" }));

    await waitFor(() => {
      expect(mockAddImage).toHaveBeenCalledWith(
        expect.objectContaining({
          path: { id: 1 },
          body: expect.objectContaining({ url: "https://example.com/new.jpg" }),
        }),
      );
    });
  });

  it("画像削除ボタンをクリックするとAPIが呼ばれること", async () => {
    mockDeleteImage.mockResolvedValue({ data: {}, error: undefined });

    render(<AdminProductsPage />);
    await waitFor(() => expect(screen.getByText("テストシャツ")).toBeInTheDocument());

    fireEvent.click(screen.getAllByRole("button", { name: "画像" })[0]);

    await waitFor(() => {
      expect(screen.getByRole("form", { name: "画像追加フォーム" })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "画像削除" }));

    await waitFor(() => {
      expect(mockDeleteImage).toHaveBeenCalledWith(
        expect.objectContaining({ path: { imageId: 100 } }),
      );
    });
  });

  it("「バリエーション」ボタンを2回クリックするとバリエーション一覧が非表示になること", async () => {
    render(<AdminProductsPage />);
    await waitFor(() => expect(screen.getByText("テストシャツ")).toBeInTheDocument());

    // 1回目: 表示
    fireEvent.click(screen.getAllByRole("button", { name: "バリエーション" })[0]);
    await waitFor(() => expect(screen.getByText("M")).toBeInTheDocument());

    // 2回目: 非表示（trueブランチをカバー）
    fireEvent.click(screen.getAllByRole("button", { name: "バリエーション" })[0]);

    await waitFor(() => {
      expect(screen.queryByText("M")).not.toBeInTheDocument();
    });
  });

  it("「画像」ボタンを2回クリックすると画像セクションが非表示になること", async () => {
    render(<AdminProductsPage />);
    await waitFor(() => expect(screen.getByText("テストシャツ")).toBeInTheDocument());

    // 1回目: 表示
    fireEvent.click(screen.getAllByRole("button", { name: "画像" })[0]);
    await waitFor(() =>
      expect(screen.getByRole("form", { name: "画像追加フォーム" })).toBeInTheDocument(),
    );

    // 2回目: 非表示（trueブランチをカバー）
    fireEvent.click(screen.getAllByRole("button", { name: "画像" })[0]);

    await waitFor(() => {
      expect(
        screen.queryByRole("form", { name: "画像追加フォーム" }),
      ).not.toBeInTheDocument();
    });
  });

  it("画像がない商品の画像セクションを開くと「画像がありません」と表示されること", async () => {
    render(<AdminProductsPage />);
    await waitFor(() => expect(screen.getByText("テストシャツ")).toBeInTheDocument());

    // 非公開商品（images:[]）の画像ボタン（インデックス1）をクリック
    fireEvent.click(screen.getAllByRole("button", { name: "画像" })[1]);

    await waitFor(() => {
      expect(screen.getByText("画像がありません")).toBeInTheDocument();
    });
  });

  it("画像追加に失敗した場合エラーメッセージが表示されること", async () => {
    const user = userEvent.setup();
    mockAddImage.mockResolvedValue({ data: undefined, error: "error" });

    render(<AdminProductsPage />);
    await waitFor(() => expect(screen.getByText("テストシャツ")).toBeInTheDocument());

    fireEvent.click(screen.getAllByRole("button", { name: "画像" })[0]);
    await waitFor(() =>
      expect(screen.getByRole("form", { name: "画像追加フォーム" })).toBeInTheDocument(),
    );

    await user.type(
      screen.getByPlaceholderText("https://example.com/image.jpg"),
      "https://example.com/fail.jpg",
    );
    fireEvent.click(screen.getByRole("button", { name: "画像追加" }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("画像の追加に失敗しました");
    });
  });

  it("画像削除に失敗した場合エラーメッセージが表示されること", async () => {
    mockDeleteImage.mockResolvedValue({ data: undefined, error: "error" });

    render(<AdminProductsPage />);
    await waitFor(() => expect(screen.getByText("テストシャツ")).toBeInTheDocument());

    fireEvent.click(screen.getAllByRole("button", { name: "画像" })[0]);
    await waitFor(() =>
      expect(screen.getByRole("form", { name: "画像追加フォーム" })).toBeInTheDocument(),
    );

    fireEvent.click(screen.getByRole("button", { name: "画像削除" }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("画像の削除に失敗しました");
    });
  });
});
