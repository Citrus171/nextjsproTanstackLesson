import { useEffect, useState } from "react";
import { z } from "zod";
import { publicProductsControllerFindById, cartsControllerAddToCart } from "@/api/generated/sdk.gen";
import { MemberLayout } from "@/components/layouts/MemberLayout";
import { getToken } from "@/lib/auth";
import { toast } from "sonner";

// ── 型定義 ───────────────────────────────────────────────────────────────────

const variationSchema = z.object({
  id: z.number(),
  productId: z.number(),
  size: z.string(),
  color: z.string(),
  price: z.number(),
  stock: z.number(),
  imageUrl: z.string().nullable().optional(),
  deletedAt: z.string().nullable().optional(),
});

const productDetailSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable().optional(),
  price: z.number(),
  categoryId: z.number().nullable().optional(),
  images: z.array(z.object({ id: z.number(), url: z.string() })).optional(),
  variations: z.array(variationSchema).optional(),
  category: z
    .object({ id: z.number(), name: z.string() })
    .nullable()
    .optional(),
});

type ProductDetail = z.infer<typeof productDetailSchema>;
type Variation = z.infer<typeof variationSchema>;

// ── コンポーネント ───────────────────────────────────────────────────────────

interface ProductDetailPageProps {
  productId: number;
}

export function ProductDetailPage({ productId }: ProductDetailPageProps) {
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [selectedVariation, setSelectedVariation] = useState<Variation | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    let active = true;

    setSelectedVariation(null);
    setQuantity(1);
    setProduct(null);
    setLoading(true);
    setErrorMessage(null);

    const fetchProduct = async () => {
      const { data, error } = await publicProductsControllerFindById({
        path: { id: productId },
        throwOnError: false,
      });

      if (!active) return;

      if (error) {
        setErrorMessage("商品情報の取得に失敗しました");
        setLoading(false);
        return;
      }

      const parsed = productDetailSchema.safeParse(data);
      if (!parsed.success) {
        setErrorMessage("商品データの形式が不正です");
        setLoading(false);
        return;
      }

      setProduct(parsed.data);
      // バリエーションが1つなら自動選択
      const activeVariations = parsed.data.variations?.filter((v) => !v.deletedAt) ?? [];
      if (activeVariations.length === 1) {
        setSelectedVariation(activeVariations[0]);
      }
      setLoading(false);
    };

    void fetchProduct();

    return () => {
      active = false;
    };
  }, [productId]);

  const handleAddToCart = async () => {
    if (!selectedVariation) return;
    setAddingToCart(true);

    const { error } = await cartsControllerAddToCart({
      auth: getToken() ?? undefined,
      body: { variationId: selectedVariation.id, quantity },
      throwOnError: false,
    });

    if (error) {
      toast.error("カートへの追加に失敗しました");
      setAddingToCart(false);
      return;
    }

    toast.success("カートに追加しました");
    setAddingToCart(false);
  };

  const activeVariations = product?.variations?.filter((v) => !v.deletedAt) ?? [];

  return (
    <MemberLayout>
      <div className="max-w-3xl mx-auto p-4">
        {loading && <p>読み込み中...</p>}

        {errorMessage && (
          <p role="alert" className="text-destructive">{errorMessage}</p>
        )}

        {!loading && product && (
          <div className="space-y-6">
            {/* パンくず */}
            <nav aria-label="パンくず" className="text-sm text-muted-foreground">
              <a href="/products" className="hover:underline">商品一覧</a>
              <span className="mx-1">/</span>
              <span>{product.name}</span>
            </nav>

            <div className="grid gap-6 md:grid-cols-2">
              {/* 商品画像 */}
              <div>
                {product.images && product.images.length > 0 ? (
                  <img
                    src={product.images[0].url}
                    alt={product.name}
                    className="w-full aspect-square object-cover rounded-md border"
                  />
                ) : (
                  <div className="w-full aspect-square bg-muted rounded-md border flex items-center justify-center text-muted-foreground">
                    画像なし
                  </div>
                )}
              </div>

              {/* 商品情報 */}
              <div className="space-y-4">
                {product.category && (
                  <p className="text-sm text-muted-foreground">{product.category.name}</p>
                )}
                <h1 className="text-2xl font-bold">{product.name}</h1>

                {product.description && (
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {product.description}
                  </p>
                )}

                <p className="text-2xl font-bold">
                  ¥{(selectedVariation?.price ?? product.price).toLocaleString()}
                </p>

                {/* バリエーション選択 */}
                {activeVariations.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">バリエーションを選択</p>
                    <div className="flex flex-wrap gap-2">
                      {activeVariations.map((v) => (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => {
                            setSelectedVariation(v);
                            setQuantity((q) => Math.max(1, Math.min(q, v.stock)));
                          }}
                          disabled={v.stock === 0}
                          aria-label={`${v.size} / ${v.color}`}
                          aria-pressed={selectedVariation?.id === v.id}
                          className={[
                            "rounded-md border px-3 py-1.5 text-sm transition-colors",
                            selectedVariation?.id === v.id
                              ? "border-primary bg-primary text-primary-foreground"
                              : "hover:border-primary",
                            v.stock === 0 ? "opacity-40 cursor-not-allowed" : "",
                          ].join(" ")}
                        >
                          {v.size} / {v.color}
                          {v.stock === 0 && <span className="ml-1 text-xs">(在庫なし)</span>}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 数量選択 */}
                <div>
                  <p className="text-sm font-medium mb-2">数量</p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      disabled={quantity <= 1}
                      className="rounded border px-3 py-1 hover:bg-accent disabled:opacity-40"
                      aria-label="数量を減らす"
                    >
                      −
                    </button>
                    <span className="min-w-[2rem] text-center">{quantity}</span>
                    <button
                      type="button"
                      onClick={() =>
                        setQuantity((q) =>
                          Math.min(selectedVariation?.stock ?? 99, q + 1),
                        )
                      }
                      disabled={quantity >= (selectedVariation?.stock ?? 99)}
                      className="rounded border px-3 py-1 hover:bg-accent disabled:opacity-40"
                      aria-label="数量を増やす"
                    >
                      ＋
                    </button>
                    {selectedVariation && (
                      <span className="text-xs text-muted-foreground">
                        在庫：{selectedVariation.stock}
                      </span>
                    )}
                  </div>
                </div>

                {/* カートに追加 */}
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={
                    !selectedVariation ||
                    addingToCart ||
                    selectedVariation.stock === 0 ||
                    quantity > selectedVariation.stock
                  }
                  className="w-full rounded-md bg-primary py-3 text-sm font-bold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  {addingToCart ? "追加中..." : "カートに追加"}
                </button>

                {!selectedVariation && activeVariations.length > 0 && (
                  <p className="text-xs text-muted-foreground text-center">
                    バリエーションを選択してください
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </MemberLayout>
  );
}
