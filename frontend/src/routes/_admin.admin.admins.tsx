import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/components/layouts/AdminLayout";

export const Route = createFileRoute("/_admin/admin/admins")({
  component: AdminAdminsPage,
});

function AdminAdminsPage() {
  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold">管理者アカウント管理</h1>
    </AdminLayout>
  );
}
