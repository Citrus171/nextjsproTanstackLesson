# テスト一覧

## バックエンド（Jest）

### AdminUsersService `backend/src/admin-users/admin-users.service.spec.ts`

**findByEmail**
- [ ] 存在するメールアドレスの時、AdminUserEntityを返すこと
- [ ] 存在しないメールアドレスの時、nullを返すこと

---

### AdminJwtStrategy `backend/src/auth/strategies/admin-jwt.strategy.spec.ts`

**validate**
- [ ] 有効な管理者JWTペイロードの時、id・roleをマッピングして返すこと
- [ ] generalロールの場合もid・roleを返すこと
- [ ] type が "admin" でない時、UnauthorizedExceptionを投げること

---

### RolesGuard `backend/src/auth/guards/roles.guard.spec.ts`

- [ ] @Rolesが設定されていない時、trueを返すこと
- [ ] ユーザーのroleが必要ロールに一致する時、trueを返すこと
- [ ] generalロールがgeneralまたはsuperのどちらの要件にも対応できること
- [ ] ユーザーのroleが必要ロールに一致しない時、ForbiddenExceptionを投げること

---

### SuperAdminGuard `backend/src/auth/guards/super-admin.guard.spec.ts`

- [ ] superロールの時、アクセスを許可すること
- [ ] generalロールの時、ForbiddenExceptionを投げること
- [ ] roleが存在しない時、ForbiddenExceptionを投げること

 - [x] superロールの時、アクセスを許可すること
 - [x] generalロールの時、ForbiddenExceptionを投げること
 - [x] roleが存在しない時、ForbiddenExceptionを投げること

---

### AuthService `backend/src/auth/auth.service.spec.ts`

**register**
- [ ] 有効なname・メールアドレス・パスワードの時、id/emailを返すこと
- [ ] nameをusersService.create()に渡すこと
- [ ] パスワードをレスポンスに含まない

**login**
- [ ] 正しい認証情報でアクセストークンを返す
- [ ] JWTペイロードに type:"user" と sub が含まれること
- [ ] 存在しないメールアドレスはUnauthorizedExceptionを投げる
- [ ] パスワード不一致はUnauthorizedExceptionを投げる
- [ ] メールアドレス/パスワード不一致のエラーメッセージは同一（列挙攻撃対策）

**adminLogin**
- [ ] 正しい認証情報でアクセストークンを返す
- [ ] JWTペイロードに type:"admin"・sub・role が含まれること
- [ ] 存在しないメールアドレスはUnauthorizedExceptionを投げる
- [ ] パスワード不一致はUnauthorizedExceptionを投げる
- [ ] メールアドレス/パスワード不一致のエラーメッセージは同一（列挙攻撃対策）

---

### AuthController `backend/src/auth/auth.controller.spec.ts`

**register**
- [ ] 有効な入力の時、nameをサービスに渡してユーザー登録結果を返すこと

**login**
- [ ] 有効な認証情報の時、アクセストークンを返すこと
- [ ] サービスがエラーを投げた時、エラーが伝播すること

**adminLogin**
- [ ] 有効な認証情報の時、adminLoginサービスを呼びアクセストークンを返すこと
- [ ] サービスがエラーを投げた時、エラーが伝播すること

**adminMe**
- [ ] 認証済み管理者のidとroleを返すこと

**superOnly**
- [ ] 到達した時、ok:trueを返すこと

---

### JwtStrategy `backend/src/auth/jwt.strategy.spec.ts`

**validate**
- [ ] 有効なJWTペイロードの時、subをidにマッピングしてidを返すこと

---

### Auth DTO `backend/src/auth/dto/auth.dto.spec.ts`

**RegisterDto**
- [ ] 有効なname・メールアドレス・パスワードの時、エラーがないこと
- [ ] nameが空文字の時、nameがエラーになること
- [ ] nameが省略された時、nameがエラーになること
- [ ] メールアドレス形式が不正な時、emailがエラーになること
- [ ] パスワードが8文字未満の時、passwordがエラーになること

**LoginDto**
- [ ] 有効なメールアドレスとパスワードの時、エラーがないこと
- [ ] メールアドレス形式が不正な時、emailがエラーになること
- [ ] パスワードが空文字の時、passwordがエラーになること

---

### Auth E2E `backend/src/auth/auth.e2e-spec.ts`

**POST /auth/register**
- [ ] 有効な入力の時、ユーザーを作成してid/emailを返すこと
- [ ] メールアドレス形式が不正な時、400を返すこと
- [ ] パスワードが8文字未満の時、400を返すこと
- [ ] 同じメールアドレスが既に存在する時、409を返すこと

**POST /auth/login**
- [ ] 正しい認証情報の時、accessTokenを返すこと
- [ ] 未登録メールアドレスの時、401を返すこと
- [ ] パスワードが不一致の時、401を返すこと
- [ ] メールアドレス形式が不正な時、400を返すこと

**POST /auth/admin/login**
- [ ] 正しい認証情報の時、accessTokenを返すこと
- [ ] 未登録メールアドレスの時、401を返すこと
- [ ] パスワードが不一致の時、401を返すこと
- [ ] メールアドレス形式が不正な時、400を返すこと
- [ ] 管理者JWTのペイロードに type:'admin' と role が含まれること
- [ ] super管理者でログインした時、accessTokenを返すこと

 - [x] 正しい認証情報の時、accessTokenを返すこと
 - [x] 未登録メールアドレスの時、401を返すこと
 - [x] パスワードが不一致の時、401を返すこと
 - [x] メールアドレス形式が不正な時、400を返すこと
 - [x] 管理者JWTのペイロードに type:'admin' と role が含まれること
 - [x] super管理者でログインした時、accessTokenを返すこと

**GET /auth/admin/me**
- [ ] 管理者JWTの時、200でid・roleを返すこと
- [ ] 会員JWTの時、401を返すこと

 - [x] 管理者JWTの時、200でid・roleを返すこと
 - [x] 会員JWTの時、401を返すこと

**GET /auth/admin/super-only**
- [ ] general管理者JWTの時、403を返すこと
- [ ] super管理者JWTの時、200を返すこと

 - [x] general管理者JWTの時、403を返すこと
 - [x] super管理者JWTの時、200を返すこと

---

### UsersService `backend/src/users/users.service.spec.ts`

**create**
- [ ] 新規ユーザーを作成してname・emailを保存しパスワードをハッシュ化する
- [ ] 既存メールアドレスはConflictExceptionを投げる
- [ ] ConflictException時はsaveを呼ばない

**findByEmail**
- [ ] 存在するメールアドレスのユーザーを返す
- [ ] 存在しないメールアドレスはnullを返す

**findById**
- [ ] 存在するIDのユーザーを返す
- [ ] 存在しないIDはNotFoundExceptionを投げる

**changePassword**
- [ ] 正しい現在のパスワードの時、新しいパスワードをハッシュ化して保存する
- [ ] 現在のパスワードが不一致の時、UnauthorizedExceptionを投げる
- [ ] パスワード不一致の時はupdateを呼ばない

---

### UsersController `backend/src/users/users.controller.spec.ts`

**getMe**
- [ ] 認証済みユーザーのプロフィールを返すこと（passwordを除く）
- [ ] ユーザーが存在しない時、NotFoundExceptionが伝播すること

**changePassword**
- [ ] 正しい現在のパスワードの時、204を返すこと
- [ ] 現在のパスワードが不一致の時、UnauthorizedExceptionが伝播すること

---

### UserEntity `backend/src/users/entities/user.entity.spec.ts`

- [ ] テーブル名がusersであること
- [ ] idカラムが存在すること（PrimaryGeneratedColumn）
- [ ] emailカラムがunique制約付きで存在すること
- [ ] passwordカラムが存在すること
- [ ] nameカラムが存在すること
- [ ] addressカラムが存在すること
- [ ] deletedAtカラムが存在すること（論理削除）

---

### AdminUserEntity `backend/src/admin-users/entities/admin-user.entity.spec.ts`

- [ ] テーブル名がadmin_usersであること
- [ ] emailカラムがunique制約付きで存在すること
- [ ] passwordカラムが存在すること
- [ ] nameカラムが存在すること
- [ ] roleカラムがenum('super','general')で存在すること
- [ ] deletedAtカラムが存在すること（論理削除）

---

### CategoryEntity `backend/src/categories/entities/category.entity.spec.ts`

- [ ] テーブル名がcategoriesであること
- [ ] nameカラムが存在すること
- [ ] parentIdカラムがnullableで存在すること
- [ ] 自己参照リレーション（parentId FK）が存在すること

---

### ProductEntity `backend/src/products/entities/product.entity.spec.ts`

- [ ] テーブル名がproductsであること
- [ ] nameカラムが存在すること
- [ ] priceカラムがINT型で存在すること
- [ ] stockカラムが存在しないこと（バリエーションで管理）
- [ ] isPublishedプロパティのカラムが存在すること
- [ ] deletedAtカラムが存在すること（論理削除）
- [ ] categoryへのリレーションが存在すること

---

### ProductImageEntity `backend/src/products/entities/product-image.entity.spec.ts`

- [ ] テーブル名がproduct_imagesであること
- [ ] productIdカラムがINT型で存在すること
- [ ] urlカラムが存在すること
- [ ] sortOrderカラムがINT型で存在すること
- [ ] productsへのリレーション（productId FK）が存在すること

---

### ProductVariationEntity `backend/src/products/entities/product-variation.entity.spec.ts`

- [ ] テーブル名がproduct_variationsであること
- [ ] stockカラムがINT型で存在すること
- [ ] sizeカラムが存在すること
- [ ] colorカラムが存在すること
- [ ] priceカラムがINT型で存在すること
- [ ] deletedAtカラムが存在すること（論理削除）

---

### CartEntity `backend/src/carts/entities/cart.entity.spec.ts`

- [ ] テーブル名がcartsであること
- [ ] sessionIdカラムが存在すること
- [ ] variationIdカラムが存在すること
- [ ] quantityカラムがINT型で存在すること
- [ ] reservedAtカラムが存在すること
- [ ] expiresAtカラムが存在すること
- [ ] product_variationsへのリレーションが存在すること

---

### OrderEntity `backend/src/orders/entities/order.entity.spec.ts`

- [ ] テーブル名がordersであること
- [ ] statusカラムがenum型で存在すること
- [ ] shippingAddressカラムがJSON型で存在すること
- [ ] shippingFeeカラムがINT型で存在すること
- [ ] totalAmountカラムがINT型で存在すること
- [ ] stripeSessionIdカラムがnullableで存在すること
- [ ] usersへのリレーションが存在すること

---

### OrderItemEntity `backend/src/orders/entities/order-item.entity.spec.ts`

- [ ] テーブル名がorder_itemsであること
- [ ] orderIdカラムがINT型で存在すること
- [ ] variationIdカラムがINT型で存在すること
- [ ] productIdカラムがINT型で存在すること
- [ ] productNameカラムが存在すること（スナップショット）
- [ ] sizeカラムが存在すること（スナップショット）
- [ ] colorカラムが存在すること（スナップショット）
- [ ] priceカラムがINT型で存在すること（スナップショット）
- [ ] ordersへのリレーション（orderId FK）が存在すること
- [ ] product_variationsへのリレーション（variationId FK）が存在すること

---

### StoreSettingsEntity `backend/src/store-settings/entities/store-settings.entity.spec.ts`

- [ ] テーブル名がstore_settingsであること
- [ ] invoiceNumberカラムがnullableで存在すること
- [ ] shippingFixedFeeカラムがINT型で存在すること
- [ ] shippingFreeThresholdカラムがINT型で存在すること

---

## フロントエンド（Vitest）

### auth ユーティリティ `frontend/src/lib/auth.test.ts`

**setToken**
- [ ] トークンをlocalStorageに保存すること

**getToken**
- [ ] 保存済みトークンを返すこと
- [ ] トークンが未保存の時はnullを返すこと

**removeToken**
- [ ] localStorageからトークンを削除すること

**isAuthenticated**
- [ ] トークンが存在する時はtrueを返すこと
- [ ] トークンが存在しない時はfalseを返すこと

**isAdminAuthenticated**
- [ ] typeがadminのJWTの時、trueを返すこと
- [ ] typeがuserのJWTの時、falseを返すこと
- [ ] JWT形式でないトークンの時、falseを返すこと

---

### admin route guard `frontend/src/routes/-_admin.test.tsx`

- [ ] 管理者トークンがない時、/admin/loginへリダイレクトすること
- [ ] 管理者トークンがある時、リダイレクトしないこと

 - [x] 管理者トークンがない時、/admin/loginへリダイレクトすること
 - [x] 管理者トークンがある時、リダイレクトしないこと

---

### admin login page `frontend/src/routes/-admin.login.test.tsx`

- [ ] 表示時、管理者ログインフォームが表示されること
- [ ] 有効な認証情報の時、トークンを保存して/adminへ遷移すること
- [ ] 認証に失敗した時、エラーメッセージを表示すること

 - [x] 表示時、管理者ログインフォームが表示されること
 - [x] 有効な認証情報の時、トークンを保存して/adminへ遷移すること
 - [x] 認証に失敗した時、エラーメッセージを表示すること

---

### MemberLayout `frontend/src/components/layouts/MemberLayout.test.tsx`

- [ ] ロゴが表示されること
- [ ] 商品一覧リンクが表示されること
- [ ] カートリンクが表示されること
- [ ] ログインリンクが表示されること
- [ ] フッターにコピーライトが表示されること
- [ ] childrenが描画されること

---

### AdminLayout `frontend/src/components/layouts/AdminLayout.test.tsx`

- [ ] サイドバーに「ダッシュボード」リンクが表示されること
- [ ] サイドバーに「商品管理」リンクが表示されること
- [ ] サイドバーに「注文管理」リンクが表示されること
- [ ] サイドバーに「会員管理」リンクが表示されること
- [ ] サイドバーに「管理者アカウント管理」リンクが表示されること
- [ ] サイドバーに「店舗設定」リンクが表示されること
- [ ] childrenが描画されること
- [ ] モバイルメニュートグルボタンが存在すること
- [ ] モバイルメニュートグルを押すとサイドバーが開閉すること

---

### RootLayout（Toast統合） `frontend/src/components/layouts/RootLayout.test.tsx`

- [ ] childrenが描画されること
- [ ] toast()を呼ぶとトースト通知が表示されること
