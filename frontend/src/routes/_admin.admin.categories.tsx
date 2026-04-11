import { createFileRoute } from "@tanstack/react-router";
import { AdminCategoriesPage } from "@/components/pages/AdminCategoriesPage";

export const Route = createFileRoute("/_admin/admin/categories")({
  component: AdminCategoriesPage,
});
