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

3. **テスト一覧ファイルの更新**（TDD 完了後）
   ```bash
   # tests/TESTS.md と tests/TESTS_TREE.md を最新の状態に更新
   # チェックボックス ✓ を付けて完了状況を記録
   ```

4. **コミット**
   ```bash
   git add .
   git commit -m "feat: issue#8 商品管理機能を実装"
   ```

5. **プッシュ**（feature ブランチ）
   ```bash
   git push origin feat/issue8/product-management
   ```

6. **GitHub で PR 作成**
   ```bash
   gh pr create --base main --head feat/issue8/product-management --title "feat: issue#8 商品管理機能を実装"
   ```
   
   GitHub Issues と自動連携（PR が閉じると Issue も自動クローズ）

7. **GitHub Actions チェック確認**
   
   この時点で GitHub Actions が自動実行：
   - OpenAPI コード生成チェック
   - バックエンド: ESLint + ユニットテスト（カバレッジ 80%）
   - フロントエンド: ESLint + ユニットテスト（カバレッジ 80%）
   
   ✅ 全チェック通過 → PR マージ可能
   ❌ チェック失敗 → 修正・再プッシュ（PR が自動更新）

7.5. **PR レビューコメント対応**（必要な場合）
   
   Copilot PR Reviewer や人的レビューからのコメントがある場合：
   
   - **コメント分析**
     ```
     各コメントを以下のいずれかに分類：
     🔴 Critical: 機能・データ整合性・セキュリティの問題
     🟡 Important: 型安全性・エラーハンドリング・UX改善
     🟡 Nice-to-have: スタイル統一・軽微な改善
     ```
   
   - **対応判定**
     ```
     全コメント対応 vs 優先度選別かを判定：
     - Critical は必須対応
     - Important は高優先度
     - Nice-to-have は判定次第
     ```
   
   - **実装 + テスト実行**
     ```bash
     # 対応項目を実装
     npm run test       # ユニットテスト実行
     npm run test:cov   # カバレッジ確認
     npm run lint       # ESLint確認
     ```
     
     ✅ テスト・lint・coverage 全通過を確認
   
   - **コミット＆プッシュ**
     ```bash
     git add .
     git commit -m "fix: [対応内容の要約]"
     git push origin feat/issue8/product-management
     ```
   
   - **コメントスレッドにリプライ**
     ```bash
     gh pr comment 29 --body "対応内容を記載"
     ```
     
     対応結果をスレッドで共有（ページ表示で反映確認）

8. **PR マージ**（GitHub Web UI）
   ```bash
   gh pr merge feat/issue8/product-management --merge
   ```
   
   ✅ main に確定

9. **ブランチ削除**
   ```bash
   git branch -d feat/issue8/product-management
   git push origin --delete feat/issue8/product-management
   ```
