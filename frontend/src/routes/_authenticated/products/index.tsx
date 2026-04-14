import { createFileRoute } from "@tanstack/react-router";
import { ProductsPage } from "@/components/pages/ProductsPage";
import { MemberLayout } from "@/components/layouts/MemberLayout";

export const Route = createFileRoute("/_authenticated/products/")({
  component: ProductsRoute,
});

function ProductsRoute() {
  return (
    <MemberLayout>
      <ProductsPage />
    </MemberLayout>
  );
}
