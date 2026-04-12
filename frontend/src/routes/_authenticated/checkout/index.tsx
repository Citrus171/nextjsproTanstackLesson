import { createFileRoute } from "@tanstack/react-router";
import { CheckoutPage } from "@/components/pages/CheckoutPage";

export const Route = createFileRoute("/_authenticated/checkout/")({
  component: CheckoutPage,
});
