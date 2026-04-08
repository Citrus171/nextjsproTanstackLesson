/**
 * @hey-api/client-fetch のベースURLを設定する
 * コンポーネントより前（main.tsx）で1回だけ呼ぶ
 */
import { client } from './generated/client.gen';

export function setupApiClient() {
  client.setConfig({ baseUrl: 'http://localhost:3000' });
}
