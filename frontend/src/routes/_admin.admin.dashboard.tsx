import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/components/layouts/AdminLayout";

export const Route = createFileRoute("/_admin/admin/dashboard")({
  component: AdminDashboardPage,
});

function AdminDashboardPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">管理ダッシュボード</h1>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* 統計カードのプレースホルダー */}
          <div className="rounded-lg border p-6">
            <h3 className="text-sm font-medium text-gray-600">総注文数</h3>
            <p className="text-2xl font-bold">-</p>
          </div>

          <div className="rounded-lg border p-6">
            <h3 className="text-sm font-medium text-gray-600">総会員数</h3>
            <p className="text-2xl font-bold">-</p>
          </div>

          <div className="rounded-lg border p-6">
            <h3 className="text-sm font-medium text-gray-600">総商品数</h3>
            <p className="text-2xl font-bold">-</p>
          </div>

          <div className="rounded-lg border p-6">
            <h3 className="text-sm font-medium text-gray-600">今月の売上</h3>
            <p className="text-2xl font-bold">¥-</p>
          </div>
        </div>

        <div className="rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-4">最近の注文</h2>
          <p className="text-gray-600">近日実装予定</p>
        </div>
      </div>
    </AdminLayout>
  );
}