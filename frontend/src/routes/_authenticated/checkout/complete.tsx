import { createFileRoute } from "@tanstack/react-router";
import { CheckoutCompletePage } from "@/components/pages/CheckoutCompletePage";

export const Route = createFileRoute("/_authenticated/checkout/complete")({
  component: CheckoutCompletePage,
});
