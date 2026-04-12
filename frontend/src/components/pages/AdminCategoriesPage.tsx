import { useEffect, useState, type ReactElement } from "react";
import { z } from "zod";
import { adminCategoriesControllerFindAll } from "@/api/generated/sdk.gen";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { getAdminToken } from "@/lib/auth";

type Category = {
  id: number;
  name: string;
  parentId: number | null;
  children: Category[];
  createdAt: string;
};

const categorySchema: z.ZodType<Category> = z.object({
  id: z.number(),
  name: z.string(),
  parentId: z.number().nullable(),
  children: z.lazy(() => z.array(categorySchema)),
  createdAt: z.string(),
});

const categoriesSchema = z.array(categorySchema);

export function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const fetchCategories = async () => {
      const { data, error } = await adminCategoriesControllerFindAll({
        auth: getAdminToken() ?? undefined,
        throwOnError: false,
      });

      if (!active) {
        return;
      }

      if (error) {
        setErrorMessage("カテゴリ一覧の取得に失敗しました");
        setLoading(false);
        return;
      }

      const parsed = categoriesSchema.safeParse(data);
      if (!parsed.success) {
        setErrorMessage("カテゴリ一覧のデータ形式が不正です");
        setLoading(false);
        return;
      }

      setCategories(parsed.data);
      setLoading(false);
    };

    void fetchCategories();

    return () => {
      active = false;
    };
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">カテゴリ管理</h1>

        {loading && <p>読み込み中...</p>}

        {errorMessage && <p className="text-destructive">{errorMessage}</p>}

        {!loading && !errorMessage && (
          <div className="overflow-x-auto rounded-md border">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-muted/40">
                <tr>
                  <th className="px-4 py-2">ID</th>
                  <th className="px-4 py-2">カテゴリ名</th>
                </tr>
              </thead>
              <tbody>
                {renderCategories(categories)}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

function renderCategories(categories: Category[], level = 0): ReactElement[] {
  return categories.flatMap((category) => [
    <tr key={`parent-${category.id}`} className="border-b last:border-0">
      <td className="px-4 py-2">{category.id}</td>
      <td className="px-4 py-2" style={{ paddingLeft: `${1 + level * 1.5}rem` }}>
        {category.name}
      </td>
    </tr>,
    ...(category.children ? renderCategories(category.children, level + 1) : []),
  ]);
}
