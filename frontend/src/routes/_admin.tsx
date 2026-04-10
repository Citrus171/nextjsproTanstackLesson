import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { isAdminAuthenticated } from "@/lib/auth";

export const Route = createFileRoute("/_admin")({
  beforeLoad: () => {
    if (!isAdminAuthenticated()) {
      throw redirect({ to: "/admin/login" });
    }
  },
  component: () => <Outlet />,
});
