import React, { useEffect, useState } from "react";
import { z } from "zod";
import {
  productsControllerFindAll,
  productsControllerCreate,
  productsControllerUpdate,
  productsControllerDelete,
  productsControllerPublish,
  productsControllerUnpublish,
  productsControllerAddVariation,
  productsControllerDeleteVariation,
  productsControllerAddImage,
  productsControllerDeleteImage,
  adminCategoriesControllerFindAll,
} from "@/api/generated/sdk.gen";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { getAdminToken } from "@/lib/auth";

// ── 型定義 ──────────────────────────────────────────────────────────────────

const categorySchema = z.object({
  id: z.number(),
  name: z.string(),
  parentId: z.number().nullable().optional(),
});

const imageSchema = z.object({
  id: z.number(),
  url: z.string(),
  sortOrder: z.number(),
});

const variationSchema = z.object({
  id: z.number(),
  productId: z.number(),
  size: z.string(),
  color: z.string(),
  price: z.number(),
  stock: z.number(),
  imageUrl: z.string().nullable().optional(),
});

const productSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable().optional(),
  price: z.number(),
  categoryId: z.number().nullable().optional(),
  isPublished: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
  images: z.array(imageSchema).optional(),
  variations: z.array(variationSchema).optional(),
});

const productsListSchema = z.object({
  data: z.array(productSchema),
  total: z.number(),
});

type Product = z.infer<typeof productSchema>;
type Variation = z.infer<typeof variationSchema>;
type Category = z.infer<typeof categorySchema>;
type ProductImage = z.infer<typeof imageSchema>;

// ── コンポーネント ───────────────────────────────────────────────────────────

export function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // フォーム表示状態
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [expandedProductId, setExpandedProductId] = useState<number | null>(null);
  const [showVariationForm, setShowVariationForm] = useState(false);
  const [expandedImageProductId, setExpandedImageProductId] = useState<number | null>(null);

  // 商品フォーム
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formCategoryId, setFormCategoryId] = useState<string>("");
  const [formIsPublished, setFormIsPublished] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);

  // バリエーションフォーム
  const [varSize, setVarSize] = useState("");
  const [varColor, setVarColor] = useState("");
  const [varPrice, setVarPrice] = useState("");
  const [varStock, setVarStock] = useState("");
  const [varSubmitting, setVarSubmitting] = useState(false);

  // 画像フォーム
  const [imageUrl, setImageUrl] = useState("");
  const [imageSubmitting, setImageSubmitting] = useState(false);

  const auth = getAdminToken() ?? undefined;

  const fetchProducts = async () => {
    setLoading(true);
    setErrorMessage(null);

    const { data, error } = await productsControllerFindAll({
      auth,
      query: { page: 1, limit: 50 },
      throwOnError: false,
    });

    if (error) {
      setErrorMessage("商品一覧の取得に失敗しました");
      setLoading(false);
      return;
    }

    const parsed = productsListSchema.safeParse(data);
    if (!parsed.success) {
      setErrorMessage("商品データの形式が不正です");
      setLoading(false);
      return;
    }

    setProducts(parsed.data.data);
    setTotal(parsed.data.total);
    setLoading(false);
  };

  const fetchCategories = async () => {
    const { data } = await adminCategoriesControllerFindAll({
      auth,
      throwOnError: false,
    });
    if (data) {
      const parsed = z.array(categorySchema).safeParse(data);
      if (parsed.success) {
        setCategories(parsed.data);
      }
    }
  };

  useEffect(() => {
    void fetchCategories();
    void fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── 商品作成 ────────────────────────────────────────────────────────────────

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);
    setErrorMessage(null);

    const { error } = await productsControllerCreate({
      auth,
      body: {
        name: formName,
        description: formDescription || undefined,
        price: Number(formPrice),
        categoryId: formCategoryId ? Number(formCategoryId) : undefined,
        isPublished: formIsPublished,
      },
      throwOnError: false,
    });

    if (error) {
      setErrorMessage("商品の登録に失敗しました");
      setFormSubmitting(false);
      return;
    }

    setSuccessMessage("商品を登録しました");
    setShowCreateForm(false);
    resetForm();
    setFormSubmitting(false);
    await fetchProducts();
  };

  // ── 商品更新 ────────────────────────────────────────────────────────────────

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    setFormSubmitting(true);
    setErrorMessage(null);

    const { error } = await productsControllerUpdate({
      auth,
      path: { id: editingProduct.id },
      body: {
        name: formName,
        description: formDescription || undefined,
        price: Number(formPrice),
        categoryId: formCategoryId ? Number(formCategoryId) : null,
      },
      throwOnError: false,
    });

    if (error) {
      setErrorMessage("商品の更新に失敗しました");
      setFormSubmitting(false);
      return;
    }

    setSuccessMessage("商品を更新しました");
    setEditingProduct(null);
    setFormSubmitting(false);
    await fetchProducts();
  };

  // ── 商品削除 ────────────────────────────────────────────────────────────────

  const handleDelete = async (id: number) => {
    if (!window.confirm("この商品を削除しますか？")) return;
    setErrorMessage(null);

    const { error } = await productsControllerDelete({
      auth,
      path: { id },
      throwOnError: false,
    });

    if (error) {
      setErrorMessage("商品の削除に失敗しました");
      return;
    }

    setSuccessMessage("商品を削除しました");
    await fetchProducts();
  };

  // ── 公開切り替え ──────────────────────────────────────────────────────────

  const handleTogglePublish = async (product: Product) => {
    setErrorMessage(null);

    const { error } = product.isPublished
      ? await productsControllerUnpublish({ auth, path: { id: product.id }, throwOnError: false })
      : await productsControllerPublish({ auth, path: { id: product.id }, throwOnError: false });

    if (error) {
      setErrorMessage("公開状態の変更に失敗しました");
      return;
    }

    setSuccessMessage(product.isPublished ? "非公開にしました" : "公開しました");
    await fetchProducts();
  };

  // ── バリエーション追加 ────────────────────────────────────────────────────

  const handleAddVariation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (expandedProductId === null) return;
    setVarSubmitting(true);
    setErrorMessage(null);

    const { error } = await productsControllerAddVariation({
      auth,
      path: { id: expandedProductId },
      body: {
        size: varSize,
        color: varColor,
        price: Number(varPrice),
        stock: Number(varStock),
      },
      throwOnError: false,
    });

    if (error) {
      setErrorMessage("バリエーションの追加に失敗しました");
      setVarSubmitting(false);
      return;
    }

    setSuccessMessage("バリエーションを追加しました");
    setShowVariationForm(false);
    setVarSize("");
    setVarColor("");
    setVarPrice("");
    setVarStock("");
    setVarSubmitting(false);
    await fetchProducts();
  };

  // ── バリエーション削除 ────────────────────────────────────────────────────

  const handleDeleteVariation = async (variationId: number) => {
    if (!window.confirm("このバリエーションを削除しますか？")) return;
    setErrorMessage(null);

    const { error } = await productsControllerDeleteVariation({
      auth,
      path: { variationId },
      throwOnError: false,
    });

    if (error) {
      setErrorMessage("バリエーションの削除に失敗しました");
      return;
    }

    setSuccessMessage("バリエーションを削除しました");
    await fetchProducts();
  };

  // ── 画像追加 ──────────────────────────────────────────────────────────────

  const handleAddImage = async (e: React.FormEvent, productId: number) => {
    e.preventDefault();
    setImageSubmitting(true);
    setErrorMessage(null);

    const { error } = await productsControllerAddImage({
      auth,
      path: { id: productId },
      body: { url: imageUrl },
      throwOnError: false,
    });

    if (error) {
      setErrorMessage("画像の追加に失敗しました");
      setImageSubmitting(false);
      return;
    }

    setSuccessMessage("画像を追加しました");
    setImageUrl("");
    setImageSubmitting(false);
    await fetchProducts();
  };

  // ── 画像削除 ──────────────────────────────────────────────────────────────

  const handleDeleteImage = async (imageId: number) => {
    if (!window.confirm("この画像を削除しますか？")) return;
    setErrorMessage(null);

    const { error } = await productsControllerDeleteImage({
      auth,
      path: { imageId },
      throwOnError: false,
    });

    if (error) {
      setErrorMessage("画像の削除に失敗しました");
      return;
    }

    setSuccessMessage("画像を削除しました");
    await fetchProducts();
  };

  // ── 編集開始 ──────────────────────────────────────────────────────────────

  const startEdit = (product: Product) => {
    setEditingProduct(product);
    setFormName(product.name);
    setFormDescription(product.description ?? "");
    setFormPrice(String(product.price));
    setFormCategoryId(product.categoryId ? String(product.categoryId) : "");
    setShowCreateForm(false);
  };

  const resetForm = () => {
    setFormName("");
    setFormDescription("");
    setFormPrice("");
    setFormCategoryId("");
    setFormIsPublished(false);
  };

  // ── レンダリング ──────────────────────────────────────────────────────────

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">商品管理</h1>
          <button
            type="button"
            onClick={() => {
              setShowCreateForm(true);
              setEditingProduct(null);
              resetForm();
            }}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            商品登録
          </button>
        </div>

        {successMessage && (
          <p role="status" className="text-sm text-green-600">{successMessage}</p>
        )}
        {errorMessage && (
          <p role="alert" className="text-sm text-destructive">{errorMessage}</p>
        )}

        {/* 商品登録フォーム */}
        {showCreateForm && (
          <form
            onSubmit={handleCreate}
            aria-label="商品登録フォーム"
            className="rounded-md border p-4 space-y-3"
          >
            <h2 className="font-semibold">新規商品登録</h2>
            <ProductFormFields
              name={formName}
              description={formDescription}
              price={formPrice}
              categoryId={formCategoryId}
              categories={categories}
              onNameChange={setFormName}
              onDescriptionChange={setFormDescription}
              onPriceChange={setFormPrice}
              onCategoryIdChange={setFormCategoryId}
            />
            {/* 公開状態 */}
            <div className="flex items-center gap-2">
              <input
                id="form-is-published"
                type="checkbox"
                checked={formIsPublished}
                onChange={(e) => setFormIsPublished(e.target.checked)}
                className="h-4 w-4"
              />
              <label htmlFor="form-is-published" className="text-sm font-medium">
                登録後すぐに公開する
              </label>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={formSubmitting}
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {formSubmitting ? "登録中..." : "登録する"}
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="rounded-md border px-4 py-2 text-sm"
              >
                キャンセル
              </button>
            </div>
          </form>
        )}

        {/* 商品編集フォーム */}
        {editingProduct && (
          <form
            onSubmit={handleUpdate}
            aria-label="商品編集フォーム"
            className="rounded-md border p-4 space-y-3"
          >
            <h2 className="font-semibold">商品編集：{editingProduct.name}</h2>
            <ProductFormFields
              name={formName}
              description={formDescription}
              price={formPrice}
              categoryId={formCategoryId}
              categories={categories}
              onNameChange={setFormName}
              onDescriptionChange={setFormDescription}
              onPriceChange={setFormPrice}
              onCategoryIdChange={setFormCategoryId}
            />
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={formSubmitting}
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {formSubmitting ? "更新中..." : "更新する"}
              </button>
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="rounded-md border px-4 py-2 text-sm"
              >
                キャンセル
              </button>
            </div>
          </form>
        )}

        {loading && <p>読み込み中...</p>}

        {!loading && !errorMessage && (
          <>
            <p className="text-sm text-muted-foreground">全{total}件</p>
            <div className="overflow-x-auto rounded-md border">
              <table className="w-full text-left text-sm">
                <thead className="border-b bg-muted/40">
                  <tr>
                    <th className="px-4 py-2">ID</th>
                    <th className="px-4 py-2">商品名</th>
                    <th className="px-4 py-2">価格</th>
                    <th className="px-4 py-2">公開状態</th>
                    <th className="px-4 py-2">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <React.Fragment key={product.id}>
                      <tr className="border-b last:border-0">
                        <td className="px-4 py-2">{product.id}</td>
                        <td className="px-4 py-2 font-medium">{product.name}</td>
                        <td className="px-4 py-2">¥{product.price.toLocaleString()}</td>
                        <td className="px-4 py-2">
                          <span
                            className={
                              product.isPublished
                                ? "text-green-600 font-medium"
                                : "text-muted-foreground"
                            }
                          >
                            {product.isPublished ? "公開" : "非公開"}
                          </span>
                        </td>
                        <td className="px-4 py-2">
                          <div className="flex flex-wrap gap-1">
                            <button
                              type="button"
                              onClick={() => startEdit(product)}
                              className="rounded px-2 py-1 text-xs border hover:bg-accent"
                            >
                              編集
                            </button>
                            <button
                              type="button"
                              onClick={() => handleTogglePublish(product)}
                              className="rounded px-2 py-1 text-xs border hover:bg-accent"
                            >
                              {product.isPublished ? "非公開にする" : "公開する"}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (expandedProductId === product.id) {
                                  setExpandedProductId(null);
                                  setShowVariationForm(false);
                                } else {
                                  setExpandedProductId(product.id);
                                  setShowVariationForm(false);
                                }
                                setExpandedImageProductId(null);
                              }}
                              className="rounded px-2 py-1 text-xs border hover:bg-accent"
                            >
                              バリエーション
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (expandedImageProductId === product.id) {
                                  setExpandedImageProductId(null);
                                } else {
                                  setExpandedImageProductId(product.id);
                                }
                                setExpandedProductId(null);
                                setShowVariationForm(false);
                              }}
                              className="rounded px-2 py-1 text-xs border hover:bg-accent"
                            >
                              画像
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(product.id)}
                              className="rounded px-2 py-1 text-xs bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              削除
                            </button>
                          </div>
                        </td>
                      </tr>
                      {expandedProductId === product.id && (
                        <tr className="bg-muted/20">
                          <td colSpan={5} className="px-6 py-3">
                            <VariationSection
                              product={product}
                              showForm={showVariationForm}
                              onToggleForm={() => setShowVariationForm((v) => !v)}
                              varSize={varSize}
                              varColor={varColor}
                              varPrice={varPrice}
                              varStock={varStock}
                              varSubmitting={varSubmitting}
                              onVarSizeChange={setVarSize}
                              onVarColorChange={setVarColor}
                              onVarPriceChange={setVarPrice}
                              onVarStockChange={setVarStock}
                              onAddVariation={handleAddVariation}
                              onDeleteVariation={handleDeleteVariation}
                            />
                          </td>
                        </tr>
                      )}
                      {expandedImageProductId === product.id && (
                        <tr className="bg-muted/20">
                          <td colSpan={5} className="px-6 py-3">
                            <ImageSection
                              product={product}
                              imageUrl={imageUrl}
                              imageSubmitting={imageSubmitting}
                              onImageUrlChange={setImageUrl}
                              onAddImage={(e) => handleAddImage(e, product.id)}
                              onDeleteImage={handleDeleteImage}
                            />
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}

// ── サブコンポーネント ─────────────────────────────────────────────────────

interface ProductFormFieldsProps {
  name: string;
  description: string;
  price: string;
  categoryId: string;
  categories: Category[];
  onNameChange: (v: string) => void;
  onDescriptionChange: (v: string) => void;
  onPriceChange: (v: string) => void;
  onCategoryIdChange: (v: string) => void;
}

function ProductFormFields({
  name, description, price, categoryId, categories,
  onNameChange, onDescriptionChange, onPriceChange, onCategoryIdChange,
}: ProductFormFieldsProps) {
  return (
    <>
      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="product-name">
          商品名 <span className="text-destructive">*</span>
        </label>
        <input
          id="product-name"
          type="text"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          required
          className="w-full rounded-md border px-3 py-2 text-sm"
          placeholder="商品名を入力"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="product-description">
          説明
        </label>
        <textarea
          id="product-description"
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          className="w-full rounded-md border px-3 py-2 text-sm"
          rows={3}
          placeholder="商品の説明（任意）"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="product-price">
          価格（円） <span className="text-destructive">*</span>
        </label>
        <input
          id="product-price"
          type="number"
          value={price}
          onChange={(e) => onPriceChange(e.target.value)}
          required
          min={100}
          className="w-full rounded-md border px-3 py-2 text-sm"
          placeholder="例: 1000"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="product-category">
          カテゴリ
        </label>
        <select
          id="product-category"
          value={categoryId}
          onChange={(e) => onCategoryIdChange(e.target.value)}
          className="w-full rounded-md border px-3 py-2 text-sm"
        >
          <option value="">なし</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>
    </>
  );
}

interface VariationSectionProps {
  product: Product;
  showForm: boolean;
  onToggleForm: () => void;
  varSize: string;
  varColor: string;
  varPrice: string;
  varStock: string;
  varSubmitting: boolean;
  onVarSizeChange: (v: string) => void;
  onVarColorChange: (v: string) => void;
  onVarPriceChange: (v: string) => void;
  onVarStockChange: (v: string) => void;
  onAddVariation: (e: React.FormEvent) => void;
  onDeleteVariation: (id: number) => void;
}

function VariationSection({
  product, showForm, onToggleForm,
  varSize, varColor, varPrice, varStock, varSubmitting,
  onVarSizeChange, onVarColorChange, onVarPriceChange, onVarStockChange,
  onAddVariation, onDeleteVariation,
}: VariationSectionProps) {
  const variations: Variation[] = product.variations ?? [];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">バリエーション一覧</h3>
        <button
          type="button"
          onClick={onToggleForm}
          className="rounded px-2 py-1 text-xs border hover:bg-accent"
        >
          バリエーション追加
        </button>
      </div>

      {showForm && (
        <form onSubmit={onAddVariation} aria-label="バリエーション追加フォーム" className="space-y-2 rounded border p-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium mb-1" htmlFor="var-size">サイズ *</label>
              <input
                id="var-size"
                type="text"
                value={varSize}
                onChange={(e) => onVarSizeChange(e.target.value)}
                required
                className="w-full rounded border px-2 py-1 text-sm"
                placeholder="例: M"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" htmlFor="var-color">カラー *</label>
              <input
                id="var-color"
                type="text"
                value={varColor}
                onChange={(e) => onVarColorChange(e.target.value)}
                required
                className="w-full rounded border px-2 py-1 text-sm"
                placeholder="例: 赤"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" htmlFor="var-price">価格（円） *</label>
              <input
                id="var-price"
                type="number"
                value={varPrice}
                onChange={(e) => onVarPriceChange(e.target.value)}
                required
                min={100}
                className="w-full rounded border px-2 py-1 text-sm"
                placeholder="例: 1000"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" htmlFor="var-stock">在庫数 *</label>
              <input
                id="var-stock"
                type="number"
                value={varStock}
                onChange={(e) => onVarStockChange(e.target.value)}
                required
                min={0}
                className="w-full rounded border px-2 py-1 text-sm"
                placeholder="例: 10"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={varSubmitting}
            className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {varSubmitting ? "追加中..." : "追加する"}
          </button>
        </form>
      )}

      {variations.length === 0 ? (
        <p className="text-xs text-muted-foreground">バリエーションがありません</p>
      ) : (
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b">
              <th className="py-1 text-left">サイズ</th>
              <th className="py-1 text-left">カラー</th>
              <th className="py-1 text-left">価格</th>
              <th className="py-1 text-left">在庫</th>
              <th className="py-1 text-left">操作</th>
            </tr>
          </thead>
          <tbody>
            {variations.map((v) => (
              <tr key={v.id} className="border-b last:border-0">
                <td className="py-1">{v.size}</td>
                <td className="py-1">{v.color}</td>
                <td className="py-1">¥{v.price.toLocaleString()}</td>
                <td className="py-1">{v.stock}</td>
                <td className="py-1">
                  <button
                    type="button"
                    onClick={() => onDeleteVariation(v.id)}
                    className="rounded px-2 py-0.5 text-xs bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    削除
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

interface ImageSectionProps {
  product: Product;
  imageUrl: string;
  imageSubmitting: boolean;
  onImageUrlChange: (v: string) => void;
  onAddImage: (e: React.FormEvent) => void;
  onDeleteImage: (id: number) => void;
}

function ImageSection({
  product, imageUrl, imageSubmitting,
  onImageUrlChange, onAddImage, onDeleteImage,
}: ImageSectionProps) {
  const images: ProductImage[] = product.images ?? [];

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold">画像管理</h3>

      <form onSubmit={onAddImage} aria-label="画像追加フォーム" className="flex gap-2">
        <input
          type="url"
          value={imageUrl}
          onChange={(e) => onImageUrlChange(e.target.value)}
          placeholder="https://example.com/image.jpg"
          required
          className="flex-1 rounded border px-2 py-1 text-sm"
        />
        <button
          type="submit"
          disabled={imageSubmitting}
          className="rounded px-3 py-1 text-xs bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {imageSubmitting ? "追加中..." : "画像追加"}
        </button>
      </form>

      {images.length === 0 ? (
        <p className="text-xs text-muted-foreground">画像がありません</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {images.map((img) => (
            <div key={img.id} className="relative">
              <img
                src={img.url}
                alt={`商品画像 ${img.sortOrder + 1}`}
                className="w-16 h-16 rounded object-cover border"
              />
              <button
                type="button"
                onClick={() => onDeleteImage(img.id)}
                className="absolute -top-1 -right-1 rounded-full bg-destructive text-destructive-foreground text-xs px-1"
                aria-label="画像削除"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
