import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  usersControllerGetMe,
  usersControllerGetOrders,
  usersControllerUpdateProfile,
  usersControllerWithdraw,
} from "@/api/generated/sdk.gen";
import type { OrderSummaryDto, UserProfileDto } from "@/api/generated/types.gen";
import { getToken, removeToken } from "@/lib/auth";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const ORDER_STATUS_LABEL: Record<string, string> = {
  pending: "未払い",
  paid: "支払い済み",
  shipped: "発送済み",
  delivered: "配達完了",
  cancelled: "キャンセル済み",
  refunded: "返金済み",
};

function formatCurrency(value: number) {
  return `¥${value.toLocaleString("ja-JP")}`;
}

function formatDate(value: string) {
  return new Date(value).toLocaleString("ja-JP");
}

export function MyPage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfileDto | null>(null);
  const [orders, setOrders] = useState<OrderSummaryDto[]>([]);
  const [loading, setLoading] = useState(true);

  // プロフィール編集フォーム
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // 退会ダイアログ
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawError, setWithdrawError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const token = getToken() ?? undefined;

      try {
        const [profileRes, ordersRes] = await Promise.all([
          usersControllerGetMe({ auth: token, throwOnError: false }),
          usersControllerGetOrders({ auth: token, throwOnError: false }),
        ]);

        const profileStatus = profileRes.response?.status;
        const ordersStatus = ordersRes.response?.status;
        if (profileStatus === 401 || ordersStatus === 401) {
          removeToken();
          void navigate({ to: "/login" });
          return;
        }

        if (profileRes.data) {
          setProfile(profileRes.data);
          setName(profileRes.data.name);
          setAddress(profileRes.data.address ?? "");
        }

        if (ordersRes.data) {
          setOrders(ordersRes.data);
        }
      } finally {
        setLoading(false);
      }
    };

    void fetchData();
  }, [navigate]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMessage(null);

    const res = await usersControllerUpdateProfile({
      auth: getToken() ?? undefined,
      body: { name, address: address || null },
      throwOnError: false,
    });

    if (res.response?.status === 401) {
      removeToken();
      void navigate({ to: "/login" });
      return;
    }

    if (res.error || !res.data) {
      setProfileMessage({ type: "error", text: "更新に失敗しました" });
    } else {
      setProfile(res.data);
      setProfileMessage({ type: "success", text: "プロフィールを更新しました" });
    }

    setProfileSaving(false);
  };

  const handleWithdraw = async () => {
    setWithdrawing(true);
    setWithdrawError(null);

    const res = await usersControllerWithdraw({
      auth: getToken() ?? undefined,
      throwOnError: false,
    });

    if (res.response?.status === 401) {
      removeToken();
      void navigate({ to: "/login" });
      return;
    }

    if (res.error) {
      setWithdrawError("退会処理に失敗しました。時間をおいてお試しください。");
      setWithdrawing(false);
      return;
    }

    removeToken();
    void navigate({ to: "/login" });
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl p-4 md:p-8">
        <p>読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-10 p-4 md:p-8">
      <h1 className="text-2xl font-bold">マイページ</h1>

      {/* プロフィール編集 */}
      <section>
        <h2 className="mb-4 text-lg font-semibold">プロフィール編集</h2>
        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              名前 <span className="text-red-500">*</span>
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={50}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">メールアドレス</label>
            <input
              value={profile?.email ?? ""}
              disabled
              className="w-full border rounded px-3 py-2 bg-muted text-muted-foreground"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">住所</label>
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              maxLength={200}
              placeholder="（任意）"
              className="w-full border rounded px-3 py-2"
            />
          </div>
          {profileMessage && (
            <p
              className={
                profileMessage.type === "success" ? "text-sm text-green-600" : "text-sm text-red-600"
              }
            >
              {profileMessage.text}
            </p>
          )}
          <Button type="submit" disabled={profileSaving}>
            {profileSaving ? "保存中..." : "保存する"}
          </Button>
        </form>
      </section>

      {/* 購入履歴 */}
      <section>
        <h2 className="mb-4 text-lg font-semibold">購入履歴</h2>
        {orders.length === 0 ? (
          <p className="text-sm text-muted-foreground">まだ注文はありません</p>
        ) : (
          <div className="space-y-2">
            {orders.map((order) => (
              <div key={order.id} className="rounded border p-3 text-sm">
                <div className="flex justify-between">
                  <span>注文 #{order.id}</span>
                  <span>{ORDER_STATUS_LABEL[order.status] ?? order.status}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>{formatDate(order.createdAt)}</span>
                  <span>{formatCurrency(order.totalAmount)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 退会 */}
      <section>
        <h2 className="mb-4 text-lg font-semibold">退会</h2>
        <Dialog open={withdrawDialogOpen} onOpenChange={setWithdrawDialogOpen}>
          <DialogTrigger render={<Button variant="destructive">退会する</Button>} />
          <DialogContent showCloseButton={false}>
            <DialogHeader>
              <DialogTitle>アカウントを退会しますか？</DialogTitle>
              <DialogDescription>
                この操作は取り消せません。退会後はログイン状態が解除されます。
              </DialogDescription>
            </DialogHeader>
            {withdrawError && (
              <p className="text-sm text-red-600">{withdrawError}</p>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setWithdrawDialogOpen(false);
                  setWithdrawError(null);
                }}
                disabled={withdrawing}
              >
                キャンセル
              </Button>
              <Button variant="destructive" onClick={handleWithdraw} disabled={withdrawing}>
                {withdrawing ? "処理中..." : "退会する"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </section>
    </div>
  );
}
