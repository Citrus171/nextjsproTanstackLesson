import { test, expect } from '@playwright/test';

const API_URL = 'http://localhost:3000';
const VARIATION_ID = 1;

test('商品購入からカード決済完了まで', async ({ page, request }) => {
  test.setTimeout(120000);
  // 1. ユーザー登録
  const email = `e2e-${Date.now()}@test.com`;
  const password = 'Password123!';

  const registerRes = await request.post(`${API_URL}/auth/register`, {
    data: { name: 'E2Eテストユーザー', email, password },
  });
  expect(registerRes.ok(), 'ユーザー登録に失敗').toBeTruthy();

  // 2. ログインしてトークン取得
  const loginRes = await request.post(`${API_URL}/auth/login`, {
    data: { email, password },
  });
  expect(loginRes.ok(), 'ログインに失敗').toBeTruthy();
  const { accessToken } = await loginRes.json() as { accessToken: string };

  // 3. カートに商品追加
  const cartRes = await request.post(`${API_URL}/cart`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    data: { variationId: VARIATION_ID, quantity: 1 },
  });
  expect(cartRes.ok(), 'カート追加に失敗').toBeTruthy();

  // 4. フロントエンドに移動してlocalStorageにトークンをセット
  await page.goto('/');
  await page.evaluate((token: string) => {
    localStorage.setItem('access_token', token);
  }, accessToken);

  // 5. カートページでアイテム確認
  await page.goto('/cart');
  await expect(page.getByText('テスト商品')).toBeVisible({ timeout: 10000 });

  // 6. チェックアウトページへ移動
  await page.goto('/checkout');
  await expect(page.getByRole('heading', { name: '配送先入力' })).toBeVisible();

  // 7. 配送先フォーム入力
  await page.getByPlaceholder('123-4567').fill('150-0001');
  await page.getByPlaceholder('東京都').fill('東京都');
  await page.getByPlaceholder('渋谷区').fill('渋谷区');
  await page.getByPlaceholder('渋谷1-1-1').fill('渋谷1-1-1');

  // 8. Stripeで決済するボタンをクリック
  await page.getByRole('button', { name: 'Stripeで決済する' }).click();

  // 9. Stripe Checkoutページへのリダイレクト待ち
  await page.waitForURL(/checkout\.stripe\.com/, { timeout: 30000 });

  // 10. メールアドレス入力
  await page.getByPlaceholder('email@example.com').fill(email);

  // 11. カード情報入力
  await page.getByPlaceholder('1234 1234 1234 1234').fill('4242424242424242');
  await page.getByPlaceholder('MM / YY').fill('12 / 34');
  await page.getByPlaceholder('CVC').fill('123');

  // 12. カード名義入力
  await page.getByPlaceholder('Full name on card').fill('TARO YAMADA');

  // 13. 支払うボタンをクリック（英語: "Pay" / 日本語: "支払う"）
  await page.getByRole('button', { name: /^(Pay|支払う)$/ }).click();

  // 14. 決済完了ページへのリダイレクト確認
  await page.waitForURL('**/checkout/complete', { timeout: 60000 });
  await expect(page.getByText('ご注文ありがとうございます')).toBeVisible();
});
