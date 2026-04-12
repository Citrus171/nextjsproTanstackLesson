import { useEffect, useState } from "react";
import {
  adminMembersControllerDelete,
  adminMembersControllerFindAll,
  adminMembersControllerFindById,
} from "@/api/generated/sdk.gen";
import type {
  AdminMemberDetailDto,
  AdminMemberListItemDto,
} from "@/api/generated/types.gen";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { getAdminToken } from "@/lib/auth";

function formatDate(value: string | null | undefined) {
  if (!value) return "-";
  return new Date(value).toLocaleString();
}

export function AdminMembersPage() {
  const [members, setMembers] = useState<AdminMemberListItemDto[]>([]);
  const [selectedMember, setSelectedMember] =
    useState<AdminMemberDetailDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [detailErrorMessage, setDetailErrorMessage] = useState<string | null>(
    null,
  );
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchMembers = async () => {
    setLoading(true);
    setErrorMessage(null);

    const { data, error } = await adminMembersControllerFindAll({
      auth: getAdminToken() ?? undefined,
      query: { page: 1, limit: 20 },
      throwOnError: false,
    });

    if (error) {
      setErrorMessage("会員一覧の取得に失敗しました");
      setLoading(false);
      return;
    }

    setMembers(data?.items ?? []);
    setLoading(false);
  };

  useEffect(() => {
    void fetchMembers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchMemberDetail = async (id: number) => {
    setDetailLoading(true);
    setDetailErrorMessage(null);
    setSuccessMessage(null);

    const { data, error } = await adminMembersControllerFindById({
      auth: getAdminToken() ?? undefined,
      path: { id },
      throwOnError: false,
    });

    if (error) {
      setDetailErrorMessage("会員詳細の取得に失敗しました");
      setDetailLoading(false);
      return;
    }

    setSelectedMember(data ?? null);
    setDetailLoading(false);
  };

  const handleDeleteMember = async (id: number) => {
    setDeleteLoading(true);
    setErrorMessage(null);
    setDetailErrorMessage(null);
    setSuccessMessage(null);

    const { error } = await adminMembersControllerDelete({
      auth: getAdminToken() ?? undefined,
      path: { id },
      throwOnError: false,
    });

    if (error) {
      setErrorMessage("会員の削除に失敗しました");
      setDeleteLoading(false);
      return;
    }

    setSuccessMessage("会員を削除しました");
    await fetchMembers();
    if (selectedMember?.id === id) {
      setSelectedMember((prev) =>
        prev ? { ...prev, deletedAt: new Date().toISOString() } : null,
      );
    }
    setDeleteLoading(false);
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
