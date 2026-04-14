import { createFileRoute } from "@tanstack/react-router";
import { ProductDetailPage } from "@/components/pages/ProductDetailPage";
import { MemberLayout } from "@/components/layouts/MemberLayout";

export const Route = createFileRoute("/_authenticated/products/$productId")({
  component: ProductDetailRoute,
});

function ProductDetailRoute() {
  return (
    <MemberLayout>
      <ProductDetailPage />
    </MemberLayout>
  );
}
