import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  storeSettingsControllerGetSettings,
  storeSettingsControllerUpdateSettings,
} from "@/api/generated/sdk.gen";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { getAdminToken, decodeAdminToken } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const storeSettingsResponseSchema = z.object({
  id: z.number(),
  invoiceNumber: z.string().nullable().optional(),
  shippingFixedFee: z.number(),
  shippingFreeThreshold: z.number(),
  updatedAt: z.string(),
});

const updateFormSchema = z.object({
  invoiceNumber: z.string().nullable().optional(),
  shippingFixedFee: z.number().min(1, "配送料は1円以上である必要があります"),
  shippingFreeThreshold: z.number().min(1, "無料配送閾値は1円以上である必要があります"),
});

type UpdateFormValues = z.infer<typeof updateFormSchema>;

export function AdminStoreSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    setValue,
  } = useForm<UpdateFormValues>({
    resolver: zodResolver(updateFormSchema),
  });

  // Fetch settings
  useEffect(() => {
    let active = true;

    const fetchSettings = async () => {
      const { data, error } = await storeSettingsControllerGetSettings({
        auth: getAdminToken() ?? undefined,
        throwOnError: false,
      });

      if (!active) {
        return;
      }

      if (error) {
        setErrorMessage("店舗設定の取得に失敗しました");
        setLoading(false);
        return;
      }

      const parsed = storeSettingsResponseSchema.safeParse(data);
      if (!parsed.success) {
        setErrorMessage("店舗設定のデータ形式が不正です");
        setLoading(false);
        return;
      }

      // Set form values
      setValue("invoiceNumber", parsed.data.invoiceNumber ?? "");
      setValue("shippingFixedFee", parsed.data.shippingFixedFee);
      setValue("shippingFreeThreshold", parsed.data.shippingFreeThreshold);

      // Check admin role
      const token = getAdminToken();
      if (token) {
        const decoded = decodeAdminToken(token);
        setIsSuperAdmin(decoded.role === "super");
      }

      setLoading(false);
    };

    void fetchSettings();

    return () => {
      active = false;
    };
  }, [setValue]);

  const onSubmit = async (data: UpdateFormValues) => {
    const { data: res, error } = await storeSettingsControllerUpdateSettings({
      body: data,
      auth: getAdminToken() ?? undefined,
      throwOnError: false,
    });

    if (error || !res) {
      setError("root", {
        message: "更新に失敗しました",
      });
      return;
    }

    const parsed = storeSettingsResponseSchema.safeParse(res);
    if (!parsed.success) {
      setError("root", {
        message: "更新に失敗しました",
      });
      return;
    }

    toast.success("店舗設定を更新しました");
  };

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-2xl">
        <h1 className="text-2xl font-bold">店舗設定</h1>

        {loading && <p>読み込み中...</p>}

        {errorMessage && (
          <p className="text-sm text-destructive">{errorMessage}</p>
        )}

        {!loading && !errorMessage && (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4"
            noValidate
          >
            <div className="space-y-1">
              <Label htmlFor="invoiceNumber">インボイスT番号</Label>
              <Input
                id="invoiceNumber"
                type="text"
                placeholder="T1234567890123"
                disabled={!isSuperAdmin}
                {...register("invoiceNumber")}
              />
              {errors.invoiceNumber && (
                <p className="text-sm text-destructive">
                  {errors.invoiceNumber.message}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="shippingFixedFee">配送料（1円以上）</Label>
              <Input
                id="shippingFixedFee"
                type="number"
                min="1"
                disabled={!isSuperAdmin}
                {...register("shippingFixedFee", { valueAsNumber: true })}
              />
              {errors.shippingFixedFee && (
                <p className="text-sm text-destructive">
                  {errors.shippingFixedFee.message}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="shippingFreeThreshold">
                送料無料となる購入金額の閾値
              </Label>
              <Input
                id="shippingFreeThreshold"
                type="number"
                min="1"
                disabled={!isSuperAdmin}
                {...register("shippingFreeThreshold", {
                  valueAsNumber: true,
                })}
              />
              {errors.shippingFreeThreshold && (
                <p className="text-sm text-destructive">
                  {errors.shippingFreeThreshold.message}
                </p>
              )}
            </div>

            {errors.root && (
              <p className="text-sm text-destructive">{errors.root.message}</p>
            )}

            {isSuperAdmin && (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "更新中..." : "更新"}
              </Button>
            )}
          </form>
        )}

        {!loading && !errorMessage && !isSuperAdmin && (
          <p className="text-sm text-muted-foreground">
            読み取り専用です。Super管理者のみ編集できます。
          </p>
        )}
      </div>
    </AdminLayout>
  );
}
