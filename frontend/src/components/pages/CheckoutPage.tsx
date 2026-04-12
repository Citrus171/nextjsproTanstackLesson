import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { paymentsControllerCreateCheckoutSession } from "@/api/generated/sdk.gen";
import { getToken } from "@/lib/auth";

interface CheckoutFormValues {
  zip: string;
  prefecture: string;
  city: string;
  address1: string;
  address2?: string;
}

export function CheckoutPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFormValues>();

  const onSubmit = async (values: CheckoutFormValues) => {
    setIsSubmitting(true);
    try {
      const { data, error } = await paymentsControllerCreateCheckoutSession({
        auth: getToken() ?? undefined,
        body: values,
        throwOnError: false,
      });

      if (error || !data?.url) {
        toast.error("チェックアウトに失敗しました");
        return;
      }

      // Stripe Checkout ページへリダイレクト
      window.location.href = data.url;
    } catch {
      toast.error("チェックアウトに失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">配送先入力</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            郵便番号 <span className="text-red-500">*</span>
          </label>
          <input
            {...register("zip", { required: "郵便番号は必須です" })}
            placeholder="123-4567"
            className="w-full border rounded px-3 py-2"
          />
          {errors.zip && (
            <p className="text-red-500 text-sm mt-1">{errors.zip.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            都道府県 <span className="text-red-500">*</span>
          </label>
          <input
            {...register("prefecture", { required: "都道府県は必須です" })}
            placeholder="東京都"
            className="w-full border rounded px-3 py-2"
          />
          {errors.prefecture && (
            <p className="text-red-500 text-sm mt-1">
              {errors.prefecture.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            市区町村 <span className="text-red-500">*</span>
          </label>
          <input
            {...register("city", { required: "市区町村は必須です" })}
            placeholder="渋谷区"
            className="w-full border rounded px-3 py-2"
          />
          {errors.city && (
            <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            番地 <span className="text-red-500">*</span>
          </label>
          <input
            {...register("address1", { required: "番地は必須です" })}
            placeholder="渋谷1-1-1"
            className="w-full border rounded px-3 py-2"
          />
          {errors.address1 && (
            <p className="text-red-500 text-sm mt-1">
              {errors.address1.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            建物名・部屋番号（任意）
          </label>
          <input
            {...register("address2")}
            placeholder="〇〇マンション101"
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 bg-blue-600 text-white rounded font-bold disabled:opacity-50"
        >
          {isSubmitting ? "処理中..." : "Stripeで決済する"}
        </button>
      </form>
    </div>
  );
}
