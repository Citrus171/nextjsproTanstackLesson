import { createFileRoute } from "@tanstack/react-router";
import { AdminMembersPage } from "@/components/pages/AdminMembersPage";

export const Route = createFileRoute("/_admin/admin/members")({
  component: AdminMembersPage,
});
