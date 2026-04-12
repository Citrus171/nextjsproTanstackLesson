import { render, screen, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { CheckoutCompletePage } from "@/components/pages/CheckoutCompletePage";

const originalLocation = window.location;

// TanStack Router の Link をモック
vi.mock("@tanstack/react-router", () => ({
  Link: ({
    to,
    children,
    className,
  }: {
    to: string;
    children: React.ReactNode;
    className?: string;
  }) => (
    <a href={to} className={className}>
      {children}
    </a>
  ),
}));

describe("CheckoutCompletePage", () => {
  afterEach(() => {
    cleanup();
    Object.defineProperty(window, "location", {
      value: originalLocation,
    });
  });

  it("注文完了メッセージが表示されること", () => {
    render(<CheckoutCompletePage />);

    expect(screen.getByText("ご注文ありがとうございます")).toBeInTheDocument();
  });

  it("確認メール送信の案内が表示されること", () => {
    render(<CheckoutCompletePage />);

    expect(
      screen.getByText("ご注文を承りました。確認メールをお送りします。"),
    ).toBeInTheDocument();
  });

  it("トップページへのリンクが表示されること", () => {
    render(<CheckoutCompletePage />);

    const link = screen.getByRole("link", { name: "トップページへ" });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/");
  });
});
