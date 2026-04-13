import { createFileRoute } from "@tanstack/react-router";
import { ProductDetailPage } from "@/components/pages/ProductDetailPage";

export const Route = createFileRoute("/_authenticated/products/$productId")({
  component: ProductDetailRoute,
});

function ProductDetailRoute() {
  const { productId } = Route.useParams();
  return <ProductDetailPage productId={Number(productId)} />;
}
