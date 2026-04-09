# CLAUDE.md

## プロジェクト概要

NestJS（バックエンド）+ React（フロントエンド）のフルスタックモノレポ。

## 構成

```
nestjspro/
├── backend/   # NestJS + TypeORM + MySQL + JWT認証
└── frontend/  # React 19 + TanStack Router + TanStack Query
```

## バックエンド（backend/）

**主要技術**
- NestJS 10、TypeORM、MySQL2
- JWT認証（@nestjs/jwt + passport-jwt）
- バリデーション：class-validator / class-transformer
- Swagger：@nestjs/swagger
- ロギング：nestjs-pino
- ヘルスチェック：@nestjs/terminus

**コマンド**
```bash
cd backend
npm run start:dev      # 開発サーバー起動
npm run test           # ユニットテスト（Jest）
npm run test:e2e       # E2Eテスト
npm run test:cov       # カバレッジ計測（閾値: 80%）
npm run export:openapi # openapi.json を生成して frontend/ へ出力
npm run lint           # ESLint
```

**テスト**
- フレームワーク：Jest + ts-jest
- ファイル命名：`*.spec.ts`（ユニット）、`*.e2e-spec.ts`（E2E）
- カバレッジ閾値：lines/functions/branches/statements すべて 80%

## フロントエンド（frontend/）

**主要技術**
- React 19、TypeScript
- ルーティング：TanStack Router
- データフェッチ：TanStack Query
- APIクライアント：@hey-api/openapi-ts（OpenAPIから自動生成）
- テスト：Vitest + Testing Library + MSW

**コマンド**
```bash
cd frontend
npm run dev        # 開発サーバー起動
npm run test       # ユニットテスト（Vitest）
npm run test:cov   # カバレッジ計測
npm run codegen    # OpenAPI → APIクライアント自動生成
npm run build      # プロダクションビルド
npm run lint       # ESLint
```

## OpenAPI連携（フルスタック開発時）

```bash
# ルートで実行：バックエンドでopenapi.json生成 → フロントエンドでコード生成
npm run gen
```

## テスト方針

- バックエンド：Jest（`*.spec.ts`）
- フロントエンド：Vitest（`*.test.tsx` / `*.test.ts`）
- テストを通すためのハードコードは禁止
- カバレッジよりも実際の品質を重視
- 変更には必ずテストを書くか既存テストを更新する
- happy path・失敗ケース・境界値を必ずテストする

## テスト一覧ファイルの更新

テストコードを追加・変更・削除した後は、必ず以下の2つのファイルを最新の状態に更新すること。

- `tests/TESTS.md` — チェックボックス付きリスト形式
- `tests/TESTS_TREE.md` — ツリー形式

## 型安全

- バックエンド・フロントエンドともに `type-coverage` で 95% 以上を維持
- `any` は原則禁止
