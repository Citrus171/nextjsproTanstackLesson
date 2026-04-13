import { createFileRoute } from "@tanstack/react-router";
import { AdminOrdersPage } from "@/components/pages/AdminOrdersPage";

export const Route = createFileRoute("/_admin/admin/orders")({
  component: AdminOrdersPage,
});
