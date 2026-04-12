import { createFileRoute } from "@tanstack/react-router";
import { CartPage } from "@/components/pages/CartPage";

export const Route = createFileRoute("/_authenticated/cart")({
  component: CartPage,
});
