import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  cartsControllerGetCart,
  cartsControllerRemoveItem,
  cartsControllerUpdateItem,
} from "@/api/generated/sdk.gen";
import { getToken } from "@/lib/auth";
import type { CartEntity } from "@/api/generated/types.gen";

export function CartPage() {
  const [carts, setCarts] = useState<CartEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasNotifiedExpired, setHasNotifiedExpired] = useState(false);

  useEffect(() => {
    const fetchCarts = async () => {
      try {
        const { data, error } = await cartsControllerGetCart({
          auth: getToken() ?? undefined,
          throwOnError: false,
        });

        if (error) {
          toast.error("カートの読み込みに失敗しました");
          return;
        }

        if (data) {
          setCarts(data);

          // 期限切れアイテムをチェック
          const now = new Date();
          const hasExpired = data.some((item) => new Date(item.expiresAt) < now);

          if (hasExpired && !hasNotifiedExpired) {
            toast.warning("カートの一部が期限切れになりました");
            setHasNotifiedExpired(true);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    void fetchCarts();
  }, [hasNotifiedExpired]);

  const handleRemoveItem = async (cartId: number) => {
    try {
      const { error } = await cartsControllerRemoveItem({
        auth: getToken() ?? undefined,
        path: { id: cartId },
        throwOnError: false,
      });

      if (error) {
        toast.error("削除に失敗しました");
        return;
      }

      setCarts((prev) => prev.filter((item) => item.id !== cartId));
      toast.success("削除しました");
    } catch {
      toast.error("削除に失敗しました");
    }
  };

  const handleUpdateQuantity = async (cartId: number, newQuantity: number) => {
    try {
      const { error } = await cartsControllerUpdateItem({
        auth: getToken() ?? undefined,
        path: { id: cartId },
        body: { quantity: newQuantity },
        throwOnError: false,
      });

      if (error) {
        toast.error("更新に失敗しました");
        return;
      }

      setCarts((prev) =>
        prev.map((item) =>
          item.id === cartId ? { ...item, quantity: newQuantity } : item,
        ),
      );
      toast.success("更新しました");
    } catch {
      toast.error("更新に失敗しました");
    }
  };

  if (loading) {
    return <div className="p-4">読み込み中...</div>;
  }

  if (carts.length === 0) {
    return <div className="p-4">カートは空です</div>;
  }

  const totalPrice = carts.reduce(
    (sum, item) => sum + (item.variation?.price ?? 0) * item.quantity,
    0,
  );

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">カート</h1>

      <div className="space-y-4 mb-6">
        {carts.map((item) => (
          <div key={item.id} className="border rounded p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-bold">{item.variation?.product?.name}</h3>
                <p className="text-sm text-gray-600">
                  {item.variation?.size} / {item.variation?.color}
                </p>
              </div>
              <button
                onClick={() => handleRemoveItem(item.id)}
                className="px-2 py-1 bg-red-500 text-white rounded"
              >
                削除
              </button>
            </div>

            <div className="flex justify-between items-center">
              <div>
                <p>
                  単価: ¥{item.variation?.price?.toLocaleString()}
                  {" ×"} 数量: {item.quantity}
                </p>
                <p className="font-bold">
                  合計: ¥
                  {((item.variation?.price ?? 0) * item.quantity).toLocaleString()}
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() =>
                    item.quantity > 1 &&
                    handleUpdateQuantity(item.id, item.quantity - 1)
                  }
                  className="px-2 py-1 bg-gray-300 rounded"
                  disabled={item.quantity <= 1}
                >
                  −
                </button>
                <span className="px-3 py-1">{item.quantity}</span>
                <button
                  onClick={() =>
                    handleUpdateQuantity(item.id, item.quantity + 1)
                  }
                  className="px-2 py-1 bg-gray-300 rounded"
                >
                  ＋
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="text-right text-2xl font-bold">
        合計金額: ¥{totalPrice.toLocaleString()}
      </div>
    </div>
  );
}
