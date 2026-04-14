import { useEffect, useState } from "react";
import { z } from "zod";
import { publicProductsControllerFindAll } from "@/api/generated/sdk.gen";
import { MemberLayout } from "@/components/layouts/MemberLayout";

// ── 型定義 ───────────────────────────────────────────────────────────────────

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
  images: z.array(z.object({ id: z.number(), url: z.string() })).optional(),
  variations: z.array(variationSchema).optional(),
  category: z
    .object({ id: z.number(), name: z.string() })
    .nullable()
    .optional(),
});

const productsResponseSchema = z.object({
  data: z.array(productSchema),
  total: z.number(),
});

type Product = z.infer<typeof productSchema>;

type SortOption = "price_asc" | "price_desc" | "new";

// ── コンポーネント ───────────────────────────────────────────────────────────

export function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [keyword, setKeyword] = useState("");
  const [sort, setSort] = useState<SortOption>("new");

  const fetchProducts = async (params: { keyword: string; sort: SortOption }) => {
    setLoading(true);
    setErrorMessage(null);

    const { data, error } = await publicProductsControllerFindAll({
      query: {
        page: 1,
        limit: 50,
        keyword: params.keyword,
        sort: params.sort,
        category_id: 0,
      },
      throwOnError: false,
    });

    if (error) {
      setErrorMessage("商品一覧の取得に失敗しました");
      setLoading(false);
      return;
    }

    const parsed = productsResponseSchema.safeParse(data);
    if (!parsed.success) {
      setErrorMessage("商品データの形式が不正です");
      setLoading(false);
      return;
    }

    setProducts(parsed.data.data);
    setTotal(parsed.data.total);
    setLoading(false);
  };

  useEffect(() => {
    void fetchProducts({ keyword, sort });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    void fetchProducts({ keyword, sort });
  };

  const handleSortChange = (newSort: SortOption) => {
    setSort(newSort);
    void fetchProducts({ keyword, sort: newSort });
  };

  return (
    <MemberLayout>
      <div className="max-w-5xl mx-auto p-4 space-y-6">
        <h1 className="text-2xl font-bold">商品一覧</h1>

        {/* 検索・ソート */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="キーワードで検索"
              aria-label="キーワード検索"
              className="rounded-md border px-3 py-2 text-sm w-60"
            />
            <button
              type="submit"
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              検索
            </button>
          </form>

          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">並び替え:</span>
            <select
              value={sort}
              onChange={(e) => handleSortChange(e.target.value as SortOption)}
              aria-label="並び替え"
              className="rounded-md border px-2 py-1"
            >
              <option value="new">新着順</option>
              <option value="price_asc">価格が安い順</option>
              <option value="price_desc">価格が高い順</option>
            </select>
          </div>
        </div>

        {/* メッセージ */}
        {errorMessage && (
          <p role="alert" className="text-sm text-destructive">{errorMessage}</p>
        )}
        {loading && <p>読み込み中...</p>}

        {!loading && !errorMessage && (
          <>
            <p className="text-sm text-muted-foreground">全{total}件</p>

            {products.length === 0 ? (
              <p className="text-muted-foreground">商品が見つかりませんでした</p>
            ) : (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                {products.map((product) => (
                  <a
                    key={product.id}
                    href={`/products/${product.id}`}
                    className="group block rounded-md border p-3 hover:shadow-md transition-shadow"
                    aria-label={product.name}
                  >
                    {/* 商品画像（あれば表示） */}
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={product.images[0].url}
                        alt={product.name}
                        className="w-full aspect-square object-cover rounded mb-2"
                      />
                    ) : (
                      <div className="w-full aspect-square bg-muted rounded mb-2 flex items-center justify-center text-muted-foreground text-xs">
                        画像なし
                      </div>
                    )}
                    <p className="font-medium text-sm group-hover:underline line-clamp-2">
                      {product.name}
                    </p>
                    {product.category && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {product.category.name}
                      </p>
                    )}
                    <p className="mt-1 text-sm font-bold">
                      ¥{product.price.toLocaleString()}
                    </p>
                  </a>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </MemberLayout>
  );
}
