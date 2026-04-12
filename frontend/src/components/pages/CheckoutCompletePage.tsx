import { Link } from "@tanstack/react-router";

export function CheckoutCompletePage() {
  return (
    <div className="max-w-lg mx-auto p-4 text-center">
      <div className="text-6xl mb-4">✓</div>
      <h1 className="text-2xl font-bold mb-2">ご注文ありがとうございます</h1>
      <p className="text-gray-600 mb-6">
        ご注文を承りました。確認メールをお送りします。
      </p>
      <Link
        to="/"
        className="inline-block px-6 py-3 bg-blue-600 text-white rounded font-bold"
      >
        トップページへ
      </Link>
    </div>
  );
}
