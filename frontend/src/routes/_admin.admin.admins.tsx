import { createFileRoute } from "@tanstack/react-router";
import { AdminAdminsPage } from "@/components/pages/AdminAdminsPage";

export const Route = createFileRoute("/_admin/admin/admins")({
  component: AdminAdminsPage,
});
