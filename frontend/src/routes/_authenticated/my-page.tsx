import { createFileRoute } from "@tanstack/react-router";
import { MyPage } from "@/components/pages/MyPage";

export const Route = createFileRoute("/_authenticated/my-page")({
  component: MyPage,
});
