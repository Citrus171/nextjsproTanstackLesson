import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/components/layouts/AdminLayout";

export const Route = createFileRoute("/_admin/admin")({
  component: AdminHomePage,
});

function AdminHomePage() {
  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold">管理ダッシュボード</h1>
    </AdminLayout>
  );
}
