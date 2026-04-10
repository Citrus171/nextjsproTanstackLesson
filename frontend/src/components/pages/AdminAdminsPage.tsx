import { useEffect, useState } from "react";
import { z } from "zod";
import { adminAccountsControllerFindAll } from "@/api/generated/sdk.gen";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { getAdminToken } from "@/lib/auth";

const adminUserSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string(),
  role: z.union([z.literal("super"), z.literal("general")]),
  createdAt: z.string(),
});

const adminUsersSchema = z.array(adminUserSchema);

type AdminUser = z.infer<typeof adminUserSchema>;

export function AdminAdminsPage() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const fetchAdmins = async () => {
      const { data, error } = await adminAccountsControllerFindAll({
        auth: getAdminToken() ?? undefined,
        throwOnError: false,
      });

      if (!active) {
        return;
      }

      if (error) {
        setErrorMessage("管理者一覧の取得に失敗しました");
        setLoading(false);
        return;
      }

      const parsed = adminUsersSchema.safeParse(data);
      if (!parsed.success) {
        setErrorMessage("管理者一覧のデータ形式が不正です");
        setLoading(false);
        return;
      }

      setAdmins(parsed.data);
      setLoading(false);
    };

    void fetchAdmins();

    return () => {
      active = false;
    };
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">管理者アカウント管理</h1>

        {loading && <p>読み込み中...</p>}

        {errorMessage && <p className="text-destructive">{errorMessage}</p>}

        {!loading && !errorMessage && (
          <div className="overflow-x-auto rounded-md border">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-muted/40">
                <tr>
                  <th className="px-4 py-2">ID</th>
                  <th className="px-4 py-2">名前</th>
                  <th className="px-4 py-2">メールアドレス</th>
                  <th className="px-4 py-2">ロール</th>
                </tr>
              </thead>
              <tbody>
                {admins.map((admin) => (
                  <tr key={admin.id} className="border-b last:border-0">
                    <td className="px-4 py-2">{admin.id}</td>
                    <td className="px-4 py-2">{admin.name}</td>
                    <td className="px-4 py-2">{admin.email}</td>
                    <td className="px-4 py-2">
                      {admin.role === "super" ? "super" : "general"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
