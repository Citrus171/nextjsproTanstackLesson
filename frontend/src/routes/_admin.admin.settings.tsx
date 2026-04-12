import { createFileRoute } from "@tanstack/react-router";
import { AdminStoreSettingsPage } from "@/components/pages/AdminStoreSettingsPage";

export const Route = createFileRoute("/_admin/admin/settings")({
  component: AdminStoreSettingsPage,
});
