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

## Git ワークフロー

### ブランチ命名規則

```bash
git checkout -b feat/issue{number}/{description}
git checkout -b fix/issue{number}/{description}
git checkout -b chore/issue{number}/{description}
```

**例**
```bash
feat/issue8/product-management     # Issue #8: 商品管理機能
fix/issue9/cart-validation         # Issue #9: カート検証のバグ修正
chore/issue10/dependency-upgrade   # Issue #10: 依存関係更新
```

**メリット**
- GitHub Issues と自動連携（コミットで `#8` を参照可能）
- git log で issue 追跡が容易
- PR作成時にコンテキストが明確

### コミットメッセージ規則

Conventional Commits に従う：

```
feat: issue#8 商品管理機能を実装
fix: issue#9 カート検証エラーを修正
chore: 依存関係更新
test: issue#8 商品管理のテスト追加
docs: README更新
```

### 開発フロー

1. **ブランチ作成**（Issue 単位）
   ```bash
   git checkout -b feat/issue8/product-management
   ```

2. **開発・テスト**（ローカル）
   ```bash
   npm run test       # ユニットテスト実行
   npm run lint       # ESLint実行
   ```
   ✅ ローカルで全テスト通過を確認してからコミット

3. **コミット**
   ```bash
   git add .
   git commit -m "feat: issue#8 商品管理機能を実装"
   ```

4. **プッシュ**（feature ブランチ）
   ```bash
   git push origin feat/issue8/product-management
   ```

5. **GitHub で PR 作成**
   ```bash
   gh pr create --base main --head feat/issue8/product-management --title "feat: issue#8 商品管理機能を実装"
   ```
   
   GitHub Issues と自動連携（PR が閉じると Issue も自動クローズ）

6. **GitHub Actions チェック確認**
   
   この時点で GitHub Actions が自動実行：
   - OpenAPI コード生成チェック
   - バックエンド: ESLint + ユニットテスト（カバレッジ 80%）
   - フロントエンド: ESLint + ユニットテスト（カバレッジ 80%）
   
   ✅ 全チェック通過 → PR マージ可能
   ❌ チェック失敗 → 修正・再プッシュ（PR が自動更新）

7. **PR マージ**（GitHub Web UI）
   ```bash
   gh pr merge feat/issue8/product-management --merge
   ```
   
   ✅ main に確定

8. **ブランチ削除**
   ```bash
   git branch -d feat/issue8/product-management
   git push origin --delete feat/issue8/product-management
   ```
