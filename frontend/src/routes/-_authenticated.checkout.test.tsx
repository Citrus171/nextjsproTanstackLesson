import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import * as sonner from "sonner";
import { CheckoutPage } from "@/components/pages/CheckoutPage";

const mockCreateCheckoutSession = vi.fn();

vi.mock("@/api/generated/sdk.gen", () => ({
  paymentsControllerCreateCheckoutSession: (...args: unknown[]) =>
    mockCreateCheckoutSession(...args),
}));

vi.mock("@/lib/auth", () => ({
  getToken: () => "test-token",
}));

// window.location.href のモック
const originalLocation = window.location;

describe("CheckoutPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(sonner.toast, "error");
    // window.location.href のモックをリセット
    Object.defineProperty(window, "location", {
      value: { ...originalLocation, href: "" },
      writable: true,
    });
  });

  it("配送先フォームが表示されること", () => {
    render(<CheckoutPage />);

    expect(screen.getByText("配送先入力")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("123-4567")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("東京都")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("渋谷区")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("渋谷1-1-1")).toBeInTheDocument();
  });

  it("フォーム送信でcheckout APIが呼ばれStripeにリダイレクトすること", async () => {
    const user = userEvent.setup();
    const stripeUrl = "https://checkout.stripe.com/cs_test_xxx";

    mockCreateCheckoutSession.mockResolvedValue({
      data: { url: stripeUrl },
      error: undefined,
    });

    render(<CheckoutPage />);

    await user.type(screen.getByPlaceholderText("123-4567"), "150-0001");
    await user.type(screen.getByPlaceholderText("東京都"), "東京都");
    await user.type(screen.getByPlaceholderText("渋谷区"), "渋谷区");
    await user.type(screen.getByPlaceholderText("渋谷1-1-1"), "渋谷1-1-1");

    await user.click(screen.getByRole("button", { name: "Stripeで決済する" }));

    await waitFor(() => {
      expect(mockCreateCheckoutSession).toHaveBeenCalledWith(
        expect.objectContaining({
          body: expect.objectContaining({
            zip: "150-0001",
            prefecture: "東京都",
            city: "渋谷区",
            address1: "渋谷1-1-1",
          }),
        }),
      );
    });

    await waitFor(() => {
      expect(window.location.href).toBe(stripeUrl);
    });
  });

  it("必須フィールドが空の場合はバリデーションエラーが表示されること", async () => {
    const user = userEvent.setup();

    render(<CheckoutPage />);

    await user.click(screen.getByRole("button", { name: "Stripeで決済する" }));

    await waitFor(() => {
      expect(screen.getByText("郵便番号は必須です")).toBeInTheDocument();
    });

    expect(mockCreateCheckoutSession).not.toHaveBeenCalled();
  });

  it("API エラー時にエラートーストが表示されること", async () => {
    const user = userEvent.setup();

    mockCreateCheckoutSession.mockResolvedValue({
      data: undefined,
      error: "Bad Request",
    });

    render(<CheckoutPage />);

    await user.type(screen.getByPlaceholderText("123-4567"), "150-0001");
    await user.type(screen.getByPlaceholderText("東京都"), "東京都");
    await user.type(screen.getByPlaceholderText("渋谷区"), "渋谷区");
    await user.type(screen.getByPlaceholderText("渋谷1-1-1"), "渋谷1-1-1");

    await user.click(screen.getByRole("button", { name: "Stripeで決済する" }));

    await waitFor(() => {
      expect(sonner.toast.error).toHaveBeenCalledWith(
        "チェックアウトに失敗しました",
      );
    });
  });

  it("送信中はボタンが「処理中...」になること", async () => {
    const user = userEvent.setup();
    let resolvePromise!: (v: unknown) => void;

    mockCreateCheckoutSession.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolvePromise = resolve;
        }),
    );

    render(<CheckoutPage />);

    await user.type(screen.getByPlaceholderText("123-4567"), "150-0001");
    await user.type(screen.getByPlaceholderText("東京都"), "東京都");
    await user.type(screen.getByPlaceholderText("渋谷区"), "渋谷区");
    await user.type(screen.getByPlaceholderText("渋谷1-1-1"), "渋谷1-1-1");

    user.click(screen.getByRole("button", { name: "Stripeで決済する" }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "処理中..." })).toBeInTheDocument();
    });

    // 解決してクリーンアップ
    resolvePromise({ data: undefined, error: "error" });
  });
});
