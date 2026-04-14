import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { AdminDashboardPage } from "./_admin.admin.dashboard";

describe("Admin Dashboard Page", () => {
  it("ダッシュボードが表示されること", () => {
    render(<AdminDashboardPage />);

    expect(screen.getByText("管理ダッシュボード")).toBeInTheDocument();
    expect(screen.getByText("総注文数")).toBeInTheDocument();
    expect(screen.getByText("総会員数")).toBeInTheDocument();
    expect(screen.getByText("総商品数")).toBeInTheDocument();
    expect(screen.getByText("今月の売上")).toBeInTheDocument();
    expect(screen.getByText("最近の注文")).toBeInTheDocument();
  });
});