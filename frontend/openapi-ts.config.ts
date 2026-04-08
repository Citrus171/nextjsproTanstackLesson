import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
  // バックエンドが生成した OpenAPI spec ファイル
  input: './openapi.json',
  // 生成先ディレクトリ
  output: {
    path: './src/api/generated',
    format: 'prettier',
  },
  plugins: [
    // 型定義 + フェッチ関数を生成
    '@hey-api/client-fetch',
    // TanStack Query 用のhookを生成
    '@tanstack/react-query',
  ],
});
