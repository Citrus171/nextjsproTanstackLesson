import { useEffect, useState } from "react";
import { z } from "zod";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { getAdminToken } from "@/lib/auth";

const orderSchema = z.object({
  id: z.number(),
  status: z.string(),
  totalAmount: z.number(),
  createdAt: z.string(),
});

const memberSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string(),
  createdAt: z.string(),
  deletedAt: z.string().nullable(),
});

const memberDetailSchema = memberSchema.extend({
  address: z.string().nullable(),
  orders: z.array(orderSchema),
});

const memberListSchema = z.object({
  items: z.array(memberSchema),
  page: z.number(),
  limit: z.number(),
  total: z.number(),
});

type Member = z.infer<typeof memberSchema>;
type MemberDetail = z.infer<typeof memberDetailSchema>;

function formatDate(value: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleString();
}

export function AdminMembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedMember, setSelectedMember] = useState<MemberDetail | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [detailErrorMessage, setDetailErrorMessage] = useState<string | null>(
    null,
  );
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    void fetchMembers();
  }, []);

  const fetchWithAuth = async (
    input: RequestInfo,
    init?: RequestInit,
  ): Promise<Response> => {
    const token = getAdminToken();
    if (!token) {
      throw new Error("管理者トークンがありません");
    }

    return fetch(input, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...(init?.headers as Record<string, string> | undefined),
      },
    });
  };

  const fetchMembers = async () => {
    setLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetchWithAuth("/admin/members?page=1&limit=20");
      if (!response.ok) {
        throw new Error("会員一覧の取得に失敗しました");
      }

      const data = await response.json();
      const parsed = memberListSchema.safeParse(data);
      if (!parsed.success) {
        throw new Error("会員一覧のデータ形式が不正です");
      }

      setMembers(parsed.data.items);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "会員一覧の取得に失敗しました",
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchMemberDetail = async (id: number) => {
    setDetailLoading(true);
    setDetailErrorMessage(null);
    setSuccessMessage(null);

    try {
      const response = await fetchWithAuth(`/admin/members/${id}`);
      if (!response.ok) {
        throw new Error("会員詳細の取得に失敗しました");
      }

      const data = await response.json();
      const parsed = memberDetailSchema.safeParse(data);
      if (!parsed.success) {
        throw new Error("会員詳細のデータ形式が不正です");
      }

      setSelectedMember(parsed.data);
    } catch (error) {
      setDetailErrorMessage(
        error instanceof Error ? error.message : "会員詳細の取得に失敗しました",
      );
    } finally {
      setDetailLoading(false);
    }
  };

  const handleDeleteMember = async (id: number) => {
    setDeleteLoading(true);
    setErrorMessage(null);
    setDetailErrorMessage(null);
    setSuccessMessage(null);

    try {
      const response = await fetchWithAuth(`/admin/members/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("会員の削除に失敗しました");
      }

      setSuccessMessage("会員を削除しました");
      await fetchMembers();
      if (selectedMember?.id === id) {
        setSelectedMember((prev) =>
          prev ? { ...prev, deletedAt: new Date().toISOString() } : null,
        );
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "会員の削除に失敗しました",
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">会員管理</h1>
            <p className="text-sm text-muted-foreground">
              会員の一覧・詳細・削除を管理できます。
            </p>
          </div>
          {successMessage && (
            <p className="rounded-md bg-success/10 px-3 py-2 text-success">
              {successMessage}
            </p>
          )}
        </div>

        {loading && <p>読み込み中...</p>}
        {errorMessage && <p className="text-destructive">{errorMessage}</p>}

        {!loading && !errorMessage && (
          <div className="overflow-x-auto rounded-md border">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b bg-muted/40">
                <tr>
                  <th className="px-4 py-2">ID</th>
                  <th className="px-4 py-2">名前</th>
                  <th className="px-4 py-2">メール</th>
                  <th className="px-4 py-2">登録日</th>
                  <th className="px-4 py-2">ステータス</th>
                  <th className="px-4 py-2">操作</th>
                </tr>
              </thead>
              <tbody>
                {members.map((member) => (
                  <tr key={member.id} className="border-b last:border-0">
                    <td className="px-4 py-2">{member.id}</td>
                    <td className="px-4 py-2">{member.name}</td>
                    <td className="px-4 py-2">{member.email}</td>
                    <td className="px-4 py-2">
                      {formatDate(member.createdAt)}
                    </td>
                    <td className="px-4 py-2">
                      {member.deletedAt ? "削除済" : "有効"}
                    </td>
                    <td className="px-4 py-2 space-x-2">
                      <button
                        type="button"
                        className="rounded-md bg-primary px-3 py-1 text-sm text-white hover:bg-primary/90"
                        onClick={() => void fetchMemberDetail(member.id)}
                      >
                        詳細
                      </button>
                      <button
                        type="button"
                        className="rounded-md bg-destructive px-3 py-1 text-sm text-white hover:bg-destructive/90 disabled:cursor-not-allowed disabled:opacity-50"
                        onClick={() => void handleDeleteMember(member.id)}
                        disabled={deleteLoading || !!member.deletedAt}
                      >
                        削除
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {detailLoading && <p>詳細を読み込み中...</p>}
        {detailErrorMessage && (
          <p className="text-destructive">{detailErrorMessage}</p>
        )}

        {selectedMember && !detailLoading && (
          <div className="rounded-md border p-4">
            <h2 className="text-xl font-semibold">会員詳細</h2>
            <div className="grid gap-2 md:grid-cols-2">
              <p>
                <span className="font-semibold">ID: </span>
                {selectedMember.id}
              </p>
              <p>
                <span className="font-semibold">名前: </span>
                {selectedMember.name}
              </p>
              <p>
                <span className="font-semibold">メール: </span>
                {selectedMember.email}
              </p>
              <p>
                <span className="font-semibold">住所: </span>
                {selectedMember.address ?? "-"}
              </p>
              <p>
                <span className="font-semibold">登録日: </span>
                {formatDate(selectedMember.createdAt)}
              </p>
              <p>
                <span className="font-semibold">削除日: </span>
                {formatDate(selectedMember.deletedAt)}
              </p>
            </div>

            <div className="mt-4">
              <h3 className="text-lg font-semibold">注文履歴</h3>
              {selectedMember.orders.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  注文履歴はありません。
                </p>
              ) : (
                <div className="overflow-x-auto rounded-md border">
                  <table className="min-w-full text-left text-sm">
                    <thead className="border-b bg-muted/40">
                      <tr>
                        <th className="px-4 py-2">ID</th>
                        <th className="px-4 py-2">ステータス</th>
                        <th className="px-4 py-2">合計金額</th>
                        <th className="px-4 py-2">注文日</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedMember.orders.map((order) => (
                        <tr key={order.id} className="border-b last:border-0">
                          <td className="px-4 py-2">{order.id}</td>
                          <td className="px-4 py-2">{order.status}</td>
                          <td className="px-4 py-2">
                            {order.totalAmount.toLocaleString()}
                          </td>
                          <td className="px-4 py-2">
                            {formatDate(order.createdAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
