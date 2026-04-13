import { createFileRoute } from "@tanstack/react-router";
import { ProductsPage } from "@/components/pages/ProductsPage";

export const Route = createFileRoute("/_authenticated/products/")({
  component: ProductsPage,
});
