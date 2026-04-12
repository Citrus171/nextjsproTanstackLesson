import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { AdminStoreSettingsPage } from "@/components/pages/AdminStoreSettingsPage";

const mockGetSettings = vi.fn();
const mockUpdateSettings = vi.fn();

vi.mock("@/api/generated/sdk.gen", () => ({
  storeSettingsControllerGetSettings: (...args: unknown[]) =>
    mockGetSettings(...args),
  storeSettingsControllerUpdateSettings: (...args: unknown[]) =>
    mockUpdateSettings(...args),
}));

vi.mock("@/lib/auth", () => ({
  getAdminToken: () => "test-token",
  decodeAdminToken: () => ({
    sub: 1,
    role: "super",
    type: "admin",
  }),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("AdminStoreSettingsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("設定取得成功時、現在の設定値をフォームに表示すること", async () => {
    mockGetSettings.mockResolvedValue({
      data: {
        id: 1,
        invoiceNumber: "T1234567890123",
        shippingFixedFee: 800,
        shippingFreeThreshold: 5000,
        updatedAt: "2026-04-12T00:00:00Z",
      },
      error: undefined,
    });

    render(<AdminStoreSettingsPage />);

    await waitFor(() => {
      const fixedFeeInput = screen.getByLabelText("配送料（1円以上）");
      expect(fixedFeeInput).toHaveValue(800);
    });

    expect(screen.getByLabelText("インボイスT番号")).toHaveValue(
      "T1234567890123"
    );
    expect(screen.getByLabelText("送料無料となる購入金額の閾値")).toHaveValue(
      5000
    );
  });

  it("設定取得失敗時、エラーメッセージを表示すること", async () => {
    mockGetSettings.mockResolvedValue({
      data: undefined,
      error: "Failed to fetch",
    });

    render(<AdminStoreSettingsPage />);

    await waitFor(() => {
      expect(
        screen.getByText("店舗設定の取得に失敗しました")
      ).toBeInTheDocument();
    });
  });

  it("super管理者がフォームを送信すると、設定が更新されること", async () => {
    const user = userEvent.setup();

    mockGetSettings.mockResolvedValue({
      data: {
        id: 1,
        invoiceNumber: "T1234567890123",
        shippingFixedFee: 800,
        shippingFreeThreshold: 5000,
        updatedAt: "2026-04-12T00:00:00Z",
      },
      error: undefined,
    });

    mockUpdateSettings.mockResolvedValue({
      data: {
        id: 1,
        invoiceNumber: "T9876543210987",
        shippingFixedFee: 1000,
        shippingFreeThreshold: 7000,
        updatedAt: "2026-04-12T00:00:00Z",
      },
      error: undefined,
    });

    render(<AdminStoreSettingsPage />);

    await waitFor(() => {
      expect(screen.getByLabelText("配送料（1円以上）")).toHaveValue(800);
    });

    const fixedFeeInput = screen.getByLabelText("配送料（1円以上）");
    await user.clear(fixedFeeInput);
    await user.type(fixedFeeInput, "1000");

    const submitButton = screen.getByRole("button", { name: "更新" });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockUpdateSettings).toHaveBeenCalledWith({
        body: expect.objectContaining({
          shippingFixedFee: 1000,
        }),
        auth: "test-token",
        throwOnError: false,
      });
    });
  });

  it("PUT失敗時、エラーメッセージを表示すること", async () => {
    const user = userEvent.setup();

    mockGetSettings.mockResolvedValue({
      data: {
        id: 1,
        invoiceNumber: "T1234567890123",
        shippingFixedFee: 800,
        shippingFreeThreshold: 5000,
        updatedAt: "2026-04-12T00:00:00Z",
      },
      error: undefined,
    });

    mockUpdateSettings.mockResolvedValue({
      data: undefined,
      error: "Server error",
    });

    render(<AdminStoreSettingsPage />);

    await waitFor(() => {
      expect(screen.getByLabelText("配送料（1円以上）")).toHaveValue(800);
    });

    const fixedFeeInput = screen.getByLabelText("配送料（1円以上）");
    await user.clear(fixedFeeInput);
    await user.type(fixedFeeInput, "1000");

    const submitButton = screen.getByRole("button", { name: "更新" });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("更新に失敗しました")).toBeInTheDocument();
    });
  });

  it("配送料に0を入力すると、バリデーションエラーを表示すること", async () => {
    const user = userEvent.setup();

    mockGetSettings.mockResolvedValue({
      data: {
        id: 1,
        invoiceNumber: "T1234567890123",
        shippingFixedFee: 800,
        shippingFreeThreshold: 5000,
        updatedAt: "2026-04-12T00:00:00Z",
      },
      error: undefined,
    });

    render(<AdminStoreSettingsPage />);

    await waitFor(() => {
      expect(screen.getByLabelText("配送料（1円以上）")).toHaveValue(800);
    });

    const fixedFeeInput = screen.getByLabelText("配送料（1円以上）");
    await user.clear(fixedFeeInput);
    await user.type(fixedFeeInput, "0");

    const submitButton = screen.getByRole("button", { name: "更新" });
    await user.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText("配送料は1円以上である必要があります")
      ).toBeInTheDocument();
    });

    expect(mockUpdateSettings).not.toHaveBeenCalled();
  });
});
