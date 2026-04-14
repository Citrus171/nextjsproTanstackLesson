import { useEffect, useState } from "react";
import { z } from "zod";
import { Link } from "@tanstack/react-router";
import {
  publicProductsControllerFindAll,
  categoriesControllerFindAll,
} from "@/api/generated/sdk.gen";

// ── 型定義 ──────────────────────────────────────────────────────────────────

const categorySchema = z.object({
  id: z.number(),
  name: z.string(),
  parentId: z.number().nullable().optional(),
  children: z.array(z.any()).optional(),
  createdAt: z.string().optional(),
});

const productSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable().optional(),
  price: z.number(),
  category: categorySchema.nullable().optional(),
  images: z
    .array(
      z.object({
        id: z.number(),
        url: z.string(),
        sortOrder: z.number(),
      }),
    )
    .optional(),
  variations: z
    .array(
      z.object({
        id: z.number(),
        size: z.string(),
        color: z.string(),
        price: z.number(),
        stock: z.number(),
      }),
    )
    .optional(),
});

const productsListSchema = z.object({
  data: z.array(productSchema),
  total: z.number(),
});

type Product = z.infer<typeof productSchema>;
type Category = z.infer<typeof categorySchema>;

// ── コンポーネント ───────────────────────────────────────────────────────────

export function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // フィルタ・ソート状態
  const [keyword, setKeyword] = useState("");
  const [inputKeyword, setInputKeyword] = useState("");
  const [categoryId, setCategoryId] = useState<number | undefined>(undefined);
  const [sort, setSort] = useState<string | undefined>(undefined);

  const fetchProducts = async (params: {
    keyword?: string;
    categoryId?: number;
    sort?: string;
  }) => {
    setLoading(true);
    setErrorMessage(null);

    const { data, error } = await publicProductsControllerFindAll({
      query: {
        page: 1,
        limit: 48,
        category_id: params.categoryId as number,
        keyword: params.keyword as string,
        sort: params.sort as string,
      },
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
    const { data } = await categoriesControllerFindAll({ throwOnError: false });
    if (data) {
      const parsed = z.array(categorySchema).safeParse(data);
      if (parsed.success) {
        setCategories(parsed.data);
      }
    }
  };

  useEffect(() => {
    void fetchCategories();
    void fetchProducts({ keyword, categoryId, sort });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = () => {
    setKeyword(inputKeyword);
    void fetchProducts({ keyword: inputKeyword, categoryId, sort });
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value ? Number(e.target.value) : undefined;
    setCategoryId(val);
    void fetchProducts({ keyword, categoryId: val, sort });
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value || undefined;
    setSort(val);
    void fetchProducts({ keyword, categoryId, sort: val });
  };

  // ── レンダリング ──────────────────────────────────────────────────────────

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 md:px-6">
      <h1 className="mb-6 text-2xl font-bold">商品一覧</h1>

      {/* フィルタ・検索バー */}
      <div className="mb-6 flex flex-wrap gap-3">
        {/* キーワード検索 */}
        <div className="flex flex-1 gap-2 min-w-[200px]">
          <input
            type="text"
            value={inputKeyword}
            onChange={(e) => setInputKeyword(e.target.value)}
            placeholder="商品を検索"
            className="flex-1 rounded-md border px-3 py-2 text-sm"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearch();
            }}
          />
          <button
            type="button"
            onClick={handleSearch}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            検索
          </button>
        </div>

        {/* カテゴリフィルタ */}
        <div className="flex items-center gap-2">
          <label htmlFor="category-filter" className="text-sm font-medium">
            カテゴリ
          </label>
          <select
            id="category-filter"
            value={categoryId ?? ""}
            onChange={handleCategoryChange}
            className="rounded-md border px-3 py-2 text-sm"
          >
            <option value="">すべて</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* ソート */}
        <div className="flex items-center gap-2">
          <label htmlFor="sort-select" className="text-sm font-medium">
            並び替え
          </label>
          <select
            id="sort-select"
            value={sort ?? ""}
            onChange={handleSortChange}
            className="rounded-md border px-3 py-2 text-sm"
          >
            <option value="">新着順</option>
            <option value="price_asc">価格が安い順</option>
            <option value="price_desc">価格が高い順</option>
          </select>
        </div>
      </div>

      {errorMessage && (
        <p role="alert" className="mb-4 text-sm text-destructive">
          {errorMessage}
        </p>
      )}

      {loading ? (
        <p>読み込み中...</p>
      ) : (
        <>
          <p className="mb-4 text-sm text-muted-foreground">全{total}件</p>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          {products.length === 0 && !errorMessage && (
            <p className="text-center text-muted-foreground">
              商品が見つかりませんでした
            </p>
          )}
        </>
      )}
    </div>
  );
}

// ── 商品カード ─────────────────────────────────────────────────────────────

interface ProductCardProps {
  product: Product;
}

function ProductCard({ product }: ProductCardProps) {
  const mainImage = product.images?.[0];

  return (
    <div className="rounded-lg border overflow-hidden hover:shadow-md transition-shadow">
      {mainImage ? (
        <img
          src={mainImage.url}
          alt={product.name}
          className="w-full aspect-square object-cover"
        />
      ) : (
        <div className="w-full aspect-square bg-muted flex items-center justify-center text-muted-foreground text-sm">
          画像なし
        </div>
      )}
      <div className="p-3">
        <Link
          to={`/products/${product.id}` as string}
          className="font-medium text-sm hover:underline line-clamp-2"
        >
          {product.name}
        </Link>
        {product.category && (
          <p className="mt-1 text-xs text-muted-foreground">
            {product.category.name}
          </p>
        )}
        <p className="mt-1 text-sm font-semibold">
          ¥{product.price.toLocaleString()}
        </p>
      </div>
    </div>
  );
}
