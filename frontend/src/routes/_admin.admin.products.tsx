import { createFileRoute } from "@tanstack/react-router";
import { AdminProductsPage } from "@/components/pages/AdminProductsPage";

export const Route = createFileRoute("/_admin/admin/products")({
  component: AdminProductsPage,
});
