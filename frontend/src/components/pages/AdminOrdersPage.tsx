import { useEffect, useState } from "react";
import {
  adminOrdersControllerFindAll,
  adminOrdersControllerFindById,
  adminOrdersControllerUpdateStatus,
  adminOrdersControllerCancelOrder,
} from "@/api/generated/sdk.gen";
import type {
  AdminOrderDetailDto,
  AdminOrderListItemDto,
} from "@/api/generated/types.gen";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { getAdminToken } from "@/lib/auth";

function formatDate(value: string | null | undefined) {
  if (!value) return "-";
  return new Date(value).toLocaleString("ja-JP");
}

function formatCurrency(value: number) {
  return `¥${value.toLocaleString()}`;
}

export function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrderListItemDto[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<AdminOrderDetailDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [detailErrorMessage, setDetailErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    setErrorMessage(null);

    const { data, error } = await adminOrdersControllerFindAll({
      auth: getAdminToken() ?? undefined,
      query: { page: 1, limit: 20 },
      throwOnError: false,
    });

    if (error) {
      setErrorMessage("注文一覧の取得に失敗しました");
      setLoading(false);
      return;
    }

    setOrders(data?.items ?? []);
    setLoading(false);
  };

  useEffect(() => {
    void fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchOrderDetail = async (id: number) => {
    setDetailLoading(true);
    setDetailErrorMessage(null);
    setSuccessMessage(null);

    const { data, error } = await adminOrdersControllerFindById({
      auth: getAdminToken() ?? undefined,
      path: { id },
      throwOnError: false,
    });

    if (error) {
      setDetailErrorMessage("注文詳細の取得に失敗しました");
      setDetailLoading(false);
      return;
    }

    setSelectedOrder(data ?? null);
    setDetailLoading(false);
  };

  // 操作後のサイレント詳細再取得（successMessageをクリアしない）
  const refreshOrderDetail = async (id: number) => {
    const { data, error } = await adminOrdersControllerFindById({
      auth: getAdminToken() ?? undefined,
      path: { id },
      throwOnError: false,
    });
    if (!error && data) {
      setSelectedOrder(data);
    }
  };

  const handleUpdateStatus = async (
    id: number,
    status: "shipped" | "delivered",
  ) => {
    setActionLoading(true);
    setSuccessMessage(null);
    setDetailErrorMessage(null);

    const { error } = await adminOrdersControllerUpdateStatus({
      auth: getAdminToken() ?? undefined,
      path: { id },
      body: { status },
      throwOnError: false,
    });

    if (error) {
      setDetailErrorMessage("ステータスの更新に失敗しました");
      setActionLoading(false);
      return;
    }

    setSuccessMessage("ステータスを更新しました");
    setActionLoading(false);
    void fetchOrders();
    void refreshOrderDetail(id);
  };

  const handleCancel = async (id: number) => {
    setActionLoading(true);
    setSuccessMessage(null);
    setDetailErrorMessage(null);

    const { error } = await adminOrdersControllerCancelOrder({
      auth: getAdminToken() ?? undefined,
      path: { id },
      throwOnError: false,
    });

    if (error) {
      setDetailErrorMessage("キャンセルに失敗しました");
      setActionLoading(false);
      return;
    }

    setSuccessMessage("注文をキャンセルしました");
    setActionLoading(false);
    void fetchOrders();
    void refreshOrderDetail(id);
  };

  return (
    <AdminLayout>
      <h1 className="mb-6 text-2xl font-bold">注文管理</h1>

      {errorMessage && (
        <div className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {errorMessage}
        </div>
      )}

      <div className="flex gap-6">
        {/* 注文一覧 */}
        <div className="flex-1">
          <h2 className="mb-3 text-lg font-semibold">注文一覧</h2>
          {loading ? (
            <p className="text-muted-foreground">読み込み中...</p>
          ) : (
            <div className="overflow-x-auto rounded-md border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="p-3 text-left">ID</th>
                    <th className="p-3 text-left">会員</th>
                    <th className="p-3 text-left">ステータス</th>
                    <th className="p-3 text-right">合計</th>
                    <th className="p-3 text-left">日時</th>
                    <th className="p-3 text-center">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-b last:border-0">
                      <td className="p-3">{order.id}</td>
                      <td className="p-3">
                        <div>{order.user.name}</div>
                        <div className="text-muted-foreground">
                          {order.user.email}
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="rounded-full px-2 py-0.5 text-xs font-medium">
                          {order.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        {formatCurrency(order.totalAmount)}
                      </td>
                      <td className="p-3 text-muted-foreground">
                        {formatDate(order.createdAt.toString())}
                      </td>
                      <td className="p-3 text-center">
                        <button
                          type="button"
                          className="rounded-md border px-3 py-1 text-xs hover:bg-accent"
                          onClick={() => void fetchOrderDetail(order.id)}
                        >
                          詳細
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 注文詳細 */}
        {(detailLoading || selectedOrder) && (
          <div className="w-96 shrink-0">
            <h2 className="mb-3 text-lg font-semibold">注文詳細</h2>

            {detailErrorMessage && (
              <div className="mb-3 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {detailErrorMessage}
              </div>
            )}

            {successMessage && (
              <div className="mb-3 rounded-md bg-green-50 p-3 text-sm text-green-700">
                {successMessage}
              </div>
            )}

            {detailLoading ? (
              <p className="text-muted-foreground">読み込み中...</p>
            ) : selectedOrder ? (
              <div className="rounded-md border p-4 space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground">注文ID</p>
                  <p className="font-medium">{selectedOrder.id}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">ステータス</p>
                  <p className="font-medium">{selectedOrder.status}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">会員</p>
                  <p>{selectedOrder.user.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedOrder.user.email}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">配送先</p>
                  <p className="text-sm">
                    〒{selectedOrder.shippingAddress.zip}
                  </p>
                  <p className="text-sm">
                    {selectedOrder.shippingAddress.prefecture}
                    {selectedOrder.shippingAddress.city}
                    {selectedOrder.shippingAddress.address1}
                    {selectedOrder.shippingAddress.address2 ?? ""}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">商品明細</p>
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="text-sm border-b py-1 last:border-0">
                      <p>{item.productName}</p>
                      <p className="text-muted-foreground">
                        {item.size} / {item.color} × {item.quantity}
                      </p>
                      <p className="text-right">{formatCurrency(item.price)}</p>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-2 text-right">
                  <p className="text-xs text-muted-foreground">配送料</p>
                  <p>{formatCurrency(selectedOrder.shippingFee)}</p>
                  <p className="text-xs text-muted-foreground mt-1">合計</p>
                  <p className="font-bold">
                    {formatCurrency(selectedOrder.totalAmount)}
                  </p>
                </div>

                {/* アクションボタン */}
                <div className="flex flex-col gap-2 border-t pt-3">
                  {selectedOrder.status === "paid" && (
                    <button
                      type="button"
                      disabled={actionLoading}
                      className="w-full rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                      onClick={() =>
                        void handleUpdateStatus(selectedOrder.id, "shipped")
                      }
                    >
                      発送済みにする
                    </button>
                  )}
                  {selectedOrder.status === "shipped" && (
                    <button
                      type="button"
                      disabled={actionLoading}
                      className="w-full rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                      onClick={() =>
                        void handleUpdateStatus(selectedOrder.id, "delivered")
                      }
                    >
                      配達完了にする
                    </button>
                  )}
                  {(selectedOrder.status === "paid" ||
                    selectedOrder.status === "shipped") && (
                    <button
                      type="button"
                      disabled={actionLoading}
                      className="w-full rounded-md border border-destructive px-3 py-2 text-sm text-destructive hover:bg-destructive/10 disabled:opacity-50"
                      onClick={() => void handleCancel(selectedOrder.id)}
                    >
                      キャンセル・返金
                    </button>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* 詳細エリア（注文詳細未選択時のエラー表示） */}
        {!detailLoading && !selectedOrder && detailErrorMessage && (
          <div className="w-96 shrink-0">
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {detailErrorMessage}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
