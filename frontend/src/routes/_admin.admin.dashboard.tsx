import { useEffect, useState } from "react";
import { z } from "zod";
import { createFileRoute } from "@tanstack/react-router";
import {
  adminOrdersControllerFindAll,
  adminMembersControllerFindAll,
  productsControllerFindAll,
} from "@/api/generated/sdk.gen";
import type { AdminOrderListItemDto } from "@/api/generated/types.gen";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { getAdminToken } from "@/lib/auth";

export const Route = createFileRoute("/_admin/admin/dashboard")({
  component: AdminDashboardPage,
});

const productsListSchema = z.object({
  total: z.number(),
});

function formatCurrency(value: number) {
  return `¥${value.toLocaleString()}`;
}

function formatDate(value: string) {
  return new Date(value).toLocaleString("ja-JP");
}

function getThisMonthRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  return { start, end };
}

export function AdminDashboardPage() {
  const [totalOrders, setTotalOrders] = useState<number | null>(null);
  const [totalMembers, setTotalMembers] = useState<number | null>(null);
  const [totalProducts, setTotalProducts] = useState<number | null>(null);
  const [monthSales, setMonthSales] = useState<number | null>(null);
  const [recentOrders, setRecentOrders] = useState<AdminOrderListItemDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const auth = getAdminToken() ?? undefined;

    const fetchAll = async () => {
      setLoading(true);
      setError(null);

      const [ordersRes, membersRes, productsRes] = await Promise.all([
        adminOrdersControllerFindAll({
          auth,
          query: { limit: 20, page: 1 },
          throwOnError: false,
        }),
        adminMembersControllerFindAll({
          auth,
          query: { limit: 1, page: 1 },
          throwOnError: false,
        }),
        productsControllerFindAll({
          auth,
          query: { limit: 1, page: 1 },
          throwOnError: false,
        }),
      ]);

      if (ordersRes.error || membersRes.error) {
        setError("データの取得に失敗しました");
        setLoading(false);
        return;
      }

      // 総注文数・最近の注文
      const orders = ordersRes.data;
      setTotalOrders(orders?.total ?? 0);
      setRecentOrders(orders?.items.slice(0, 20) ?? []);

      // 今月の売上（paid / shipped / delivered のみ）
      const { start, end } = getThisMonthRange();
      const salesStatuses = new Set(["paid", "shipped", "delivered"]);
      const monthlyTotal = (orders?.items ?? [])
        .filter((o) => {
          const d = new Date(o.createdAt);
          return d >= start && d <= end && salesStatuses.has(o.status);
        })
        .reduce((sum, o) => sum + o.totalAmount, 0);
      setMonthSales(monthlyTotal);

      // 総会員数
      setTotalMembers(membersRes.data?.total ?? 0);

      // 総商品数
      const parsed = productsListSchema.safeParse(productsRes.data);
      setTotalProducts(parsed.success ? parsed.data.total : 0);

      setLoading(false);
    };

    void fetchAll();
  }, []);

  const statusLabel: Record<string, string> = {
    pending: "未払い",
    paid: "支払済",
    shipped: "発送済",
    delivered: "配達完了",
    cancelled: "キャンセル",
    refunded: "返金済",
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">管理ダッシュボード</h1>

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border p-6">
            <h3 className="text-sm font-medium text-gray-600">総注文数</h3>
            <p className="text-2xl font-bold">
              {loading ? "-" : (totalOrders ?? 0).toLocaleString()}
            </p>
          </div>

          <div className="rounded-lg border p-6">
            <h3 className="text-sm font-medium text-gray-600">総会員数</h3>
            <p className="text-2xl font-bold">
              {loading ? "-" : (totalMembers ?? 0).toLocaleString()}
            </p>
          </div>

          <div className="rounded-lg border p-6">
            <h3 className="text-sm font-medium text-gray-600">総商品数</h3>
            <p className="text-2xl font-bold">
              {loading ? "-" : (totalProducts ?? 0).toLocaleString()}
            </p>
          </div>

          <div className="rounded-lg border p-6">
            <h3 className="text-sm font-medium text-gray-600">今月の売上</h3>
            <p className="text-2xl font-bold">
              {loading ? "¥-" : formatCurrency(monthSales ?? 0)}
            </p>
          </div>
        </div>

        <div className="rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-4">最近の注文</h2>
          {loading ? (
            <p className="text-sm text-gray-500">読み込み中...</p>
          ) : recentOrders.length === 0 ? (
            <p className="text-sm text-gray-500">注文はありません</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-gray-600">
                  <th className="pb-2 pr-4">注文ID</th>
                  <th className="pb-2 pr-4">会員</th>
                  <th className="pb-2 pr-4">金額</th>
                  <th className="pb-2 pr-4">ステータス</th>
                  <th className="pb-2">日時</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="border-b last:border-0">
                    <td className="py-2 pr-4">#{order.id}</td>
                    <td className="py-2 pr-4">{order.user.name}</td>
                    <td className="py-2 pr-4">{formatCurrency(order.totalAmount)}</td>
                    <td className="py-2 pr-4">{statusLabel[order.status] ?? order.status}</td>
                    <td className="py-2">{formatDate(order.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
