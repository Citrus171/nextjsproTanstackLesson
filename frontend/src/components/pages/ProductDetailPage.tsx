import { useEffect, useState } from "react";
import { z } from "zod";
import { useParams, Link } from "@tanstack/react-router";
import {
  publicProductsControllerFindById,
  cartsControllerAddToCart,
} from "@/api/generated/sdk.gen";
import { getToken } from "@/lib/auth";

// ── 型定義 ──────────────────────────────────────────────────────────────────

const variationSchema = z.object({
  id: z.number(),
  size: z.string(),
  color: z.string(),
  price: z.number(),
  stock: z.number(),
});

const productSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable().optional(),
  price: z.number(),
  category: z
    .object({
      id: z.number(),
      name: z.string(),
    })
    .nullable()
    .optional(),
  images: z
    .array(
      z.object({
        id: z.number(),
        url: z.string(),
        sortOrder: z.number(),
      }),
    )
    .optional(),
  variations: z.array(variationSchema).optional(),
});

type Product = z.infer<typeof productSchema>;
type Variation = z.infer<typeof variationSchema>;

// ── コンポーネント ───────────────────────────────────────────────────────────

export function ProductDetailPage() {
  const { productId } = useParams({ strict: false }) as { productId: string };

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // カート操作
  const [selectedVariationId, setSelectedVariationId] = useState<
    number | null
  >(null);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  // 選択中の画像インデックス
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const auth = getToken() ?? undefined;

  useEffect(() => {
    const id = Number(productId);
    if (!id) return;

    setSelectedVariationId(null);
    setQuantity(1);

    void (async () => {
      setLoading(true);
      setErrorMessage(null);

      const { data, error } = await publicProductsControllerFindById({
        path: { id },
        throwOnError: false,
      });

      if (error) {
        setErrorMessage("商品の取得に失敗しました");
        setLoading(false);
        return;
      }

      const parsed = productSchema.safeParse(data);
      if (!parsed.success) {
        setErrorMessage("商品データの形式が不正です");
        setLoading(false);
        return;
      }

      setProduct(parsed.data);
      setLoading(false);
    })();
  }, [productId]);

  const handleAddToCart = async () => {
    if (!selectedVariationId) {
      setErrorMessage("バリエーションを選択してください");
      return;
    }

    setAddingToCart(true);
    setErrorMessage(null);

    const { error } = await cartsControllerAddToCart({
      auth,
      body: { variationId: selectedVariationId, quantity },
      throwOnError: false,
    });

    if (error) {
      setErrorMessage("カートへの追加に失敗しました");
      setAddingToCart(false);
      return;
    }

    setSuccessMessage("カートに追加しました");
    setAddingToCart(false);
  };

  // ── レンダリング ──────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-6 md:px-6">
        <p>読み込み中...</p>
      </div>
    );
  }

  if (errorMessage && !product) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-6 md:px-6">
        <p role="alert" className="text-sm text-destructive">
          {errorMessage}
        </p>
      </div>
    );
  }

  if (!product) return null;

  const images = product.images ?? [];
  const variations: Variation[] = product.variations ?? [];
  const mainImage = images[selectedImageIndex];
  const selectedVariation = variations.find(
    (v) => v.id === selectedVariationId,
  );
  const displayPrice = selectedVariation?.price ?? product.price;

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 md:px-6">
      {/* パンくず */}
      <nav className="mb-4 text-sm text-muted-foreground">
        <Link to="/products" className="hover:underline">
          商品一覧
        </Link>
        <span className="mx-1">/</span>
        <span>{product.name}</span>
      </nav>

      <div className="grid gap-8 md:grid-cols-2">
        {/* 画像エリア */}
        <div className="space-y-3">
          {mainImage ? (
            <img
              src={mainImage.url}
              alt={`${product.name} - メイン画像`}
              className="w-full rounded-lg object-cover aspect-square"
            />
          ) : (
            <div className="w-full rounded-lg bg-muted aspect-square flex items-center justify-center text-muted-foreground">
              画像なし
            </div>
          )}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {images.map((img, idx) => (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`flex-shrink-0 rounded border-2 overflow-hidden w-16 h-16 ${
                    idx === selectedImageIndex
                      ? "border-primary"
                      : "border-transparent"
                  }`}
                >
                  <img
                    src={img.url}
                    alt={`${product.name} - サムネイル${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 商品情報・カートエリア */}
        <div className="space-y-4">
          {/* カテゴリ */}
          {product.category && (
            <p className="text-sm text-muted-foreground">
              {product.category.name}
            </p>
          )}

          {/* 商品名 */}
          <h1 className="text-2xl font-bold">{product.name}</h1>

          {/* 価格 */}
          <p className="text-xl font-semibold">
            ¥{displayPrice.toLocaleString()}
          </p>

          {/* 説明 */}
          {product.description && (
            <p className="text-sm text-muted-foreground leading-relaxed">
              {product.description}
            </p>
          )}

          {/* バリエーション選択 */}
          {variations.length > 0 && (
            <div className="space-y-2">
              <label
                htmlFor="variation-select"
                className="block text-sm font-medium"
              >
                バリエーション
              </label>
              <select
                id="variation-select"
                value={selectedVariationId ?? ""}
                onChange={(e) => {
                  const newId = e.target.value
                    ? Number(e.target.value)
                    : null;
                  setSelectedVariationId(newId);
                  if (newId) {
                    const v = variations.find((v) => v.id === newId);
                    if (v)
                      setQuantity((q) => Math.max(1, Math.min(q, v.stock)));
                  }
                }}
                className="w-full rounded-md border px-3 py-2 text-sm"
              >
                <option value="">選択してください</option>
                {variations.map((v) => (
                  <option key={v.id} value={v.id} disabled={v.stock === 0}>
                    {v.size} / {v.color}
                    {v.stock === 0 ? " (在庫なし)" : ""}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* 数量選択 */}
          <div className="space-y-2">
            <label
              htmlFor="quantity-input"
              className="block text-sm font-medium"
            >
              数量
            </label>
            <input
              id="quantity-input"
              type="number"
              value={quantity}
              onChange={(e) =>
                setQuantity(Math.max(1, Number(e.target.value)))
              }
              min={1}
              max={
                selectedVariation
                  ? Math.max(1, selectedVariation.stock)
                  : 99
              }
              className="w-24 rounded-md border px-3 py-2 text-sm"
            />
          </div>

          {/* メッセージ */}
          {successMessage && (
            <p role="status" className="text-sm text-green-600">
              {successMessage}
            </p>
          )}
          {errorMessage && (
            <p role="alert" className="text-sm text-destructive">
              {errorMessage}
            </p>
          )}

          {/* カートに追加ボタン */}
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={
              !selectedVariation ||
              addingToCart ||
              selectedVariation.stock === 0 ||
              quantity > selectedVariation.stock
            }
            className="w-full rounded-md bg-primary px-4 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {addingToCart ? "追加中..." : "カートに追加"}
          </button>
        </div>
      </div>
    </div>
  );
}
