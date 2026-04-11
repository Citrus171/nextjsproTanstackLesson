# テスト一覧

## バックエンド（Jest）

### AdminUsersService `backend/src/admin-users/admin-users.service.spec.ts`

**findByEmail**
- [x] 存在するメールアドレスの時、AdminUserEntityを返すこと
- [x] 存在しないメールアドレスの時、nullを返すこと

**create**
- [x] 有効な情報でアカウント作成され、id・email・role・createdAtを返すこと

**findAll**
- [x] 全管理者を取得され、createdAtが新しい順に並ぶこと

**findById**
- [x] 存在するIDで詳細取得でき、passwordを含まないこと
- [x] 存在しないIDで詳細取得した時、nullを返すこと

**update**
- [x] 有効な更新内容でアカウント更新され、更新後の情報を返すこと
- [x] 存在しないIDで更新した時、nullを返すこと

**softDelete**
- [x] 存在するIDで論理削除に成功すること
- [x] 存在しないIDで論理削除した時、何も起こらないこと

**業務ルール・例外ケース**
- [x] email一意性制約違反時、エラーが伝搬すること
- [x] ロール値は super または general のみ許可（型安全）
- [x] 更新時、部分的な更新（nameのみ）でroleは変更されないこと

---

### AdminAccountsController `backend/src/admin-users/admin-accounts.controller.spec.ts`

**create**
- [x] 有効なDTOでアカウント作成され、レスポンスを返すこと

**findAll**
- [x] 全管理者一覧を返すこと

**findById**
- [x] 指定IDの管理者詳細を返すこと
- [x] 存在しないID時、NotFoundException投げること

**update**
- [x] 有効なDTOでアカウント更新され、更新後レスポンスを返すこと
- [x] 存在しないID時、NotFoundException投げること

**delete**
- [x] 指定IDのアカウントを論理削除すること
- [x] 存在しないID時、NotFoundException投げること

---

### CreateAdminUserDto・UpdateAdminUserDto バリデーション `backend/src/admin-users/dto/admin-user.dto.spec.ts`

**CreateAdminUserDto**
- [x] 有効なDTOでバリデーション成功すること
- [x] nameがない時、バリデーションエラー
- [x] emailが無効形式時、バリデーションエラー
- [x] passwordが8文字未満時、バリデーションエラー
- [x] roleが super でも general でもない時、バリデーションエラー
- [x] general ロール も有効

**UpdateAdminUserDto**
- [x] 全フィールド省略可能（空オブジェクト）でバリデーション成功
- [x] nameのみ更新
- [x] roleのみ更新
- [x] roleが無効値の場合、バリデーションエラー
- [x] nameとroleの両方更新

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

### CreateCategoryDto・UpdateCategoryDto バリデーション `backend/src/categories/dto/category.dto.spec.ts`

**CreateCategoryDto**
- [x] nameが50文字以内の時、バリデーション成功すること
- [x] nameが空の場合はバリデーションエラーになること
- [x] nameが50文字超の場合はバリデーションエラーになること
- [x] parentIdが省略可能であること
- [x] parentIdがnullでもバリデーションエラーにならないこと
- [x] parentIdが整数の場合はバリデーションエラーにならないこと

**UpdateCategoryDto**
- [x] 空のオブジェクトでもバリデーションエラーにならないこと
- [x] nameが50文字超の場合はバリデーションエラーになること
- [x] nameとparentIdの両方が指定されてもバリデーションエラーにならないこと

---

### CategoriesService `backend/src/categories/categories.service.spec.ts`

**findAll**
- [x] 全カテゴリを親子構造で返すこと

**create**
- [x] parentIdが指定される場合、親カテゴリが存在することを確認すること
- [x] 親が存在する場合はカテゴリを作成すること
- [x] parentIdが指定されない場合は親カテゴリなしで作成すること

**findById**
- [x] 存在するカテゴリを返すこと
- [x] 存在しないカテゴリはnullを返すこと

**update**
- [x] 存在するカテゴリを更新できること
- [x] 存在しないカテゴリはnullを返すこと
- [x] 更新時に親カテゴリが存在することを確認すること

**remove**
- [x] 商品が紐付いている場合はConflictExceptionをスローすること
- [x] 商品がない場合は削除できること

---

### AdminCategoriesController `backend/src/categories/admin-categories.controller.spec.ts`

**findAll**
- [x] 全カテゴリを返すこと

**create**
- [x] 新規カテゴリを作成すること

**update**
- [x] 存在するカテゴリを更新すること
- [x] 存在しないカテゴリではNotFoundExceptionをスローすること

**remove**
- [x] カテゴリを削除すること

---

### CategoriesController `backend/src/categories/categories.controller.spec.ts`

**findAll**
- [x] 全カテゴリを親子構造で返すこと

---

### ProductsService `backend/src/products/products.service.spec.ts`

**create**
- [x] 基本情報でプロダクトを作成できること
- [x] categoryIdが指定されたとき、カテゴリが存在すること
- [x] categoryIdが存在しない場合、NotFoundException を throw すること
- [x] nameが空の場合、BadRequestException を throw すること
- [x] priceが100未満の場合、BadRequestException を throw すること

**findById**
- [x] IDで商品を取得できること
- [x] IDが見つからない場合、NotFoundException を throw すること

**findAll**
- [x] 全商品を取得できること

**update**
- [x] 商品情報を更新できること
- [x] 更新するカテゴリが存在しない場合、NotFoundException を throw すること
- [x] 更新対象の商品が見つからない場合、NotFoundException を throw すること
- [x] updateで nameが長すぎる場合はエラー
- [x] updateで priceが最大値超過はエラー
- [x] updateで nameが空の場合はエラー
- [x] updateで price が最小値未満はエラー

**delete**
- [x] 商品を論理削除できること
- [x] 削除対象の商品が見つからない場合、NotFoundException を throw すること

**addVariation**
- [x] バリエーションを商品に追加できること
- [x] バリエーション追加時にsizeが空の場合、BadRequestException を throw すること
- [x] バリエーション追加時にpriceが100未満の場合、BadRequestException を throw すること
- [x] addVariationで stockが負数はエラー
- [x] addVariationで priceが最大値超過はエラー
- [x] addVariationで colorが空はエラー
- [x] addVariationで sizeが空はエラー

**updateVariation**
- [x] バリエーションを更新できること
- [x] 更新対象のバリエーションが見つからない場合、NotFoundException を throw すること
- [x] updateVariationで priceが最小値未満はエラー
- [x] updateVariationで sizeが長すぎるはエラー

**deleteVariation**
- [x] バリエーションを削除できること
- [x] 削除対象のバリエーションが見つからない場合、NotFoundException を throw すること

**publish**
- [x] 商品を公開できること
- [x] 公開対象の商品が見つからない場合、NotFoundException を throw すること

**unpublish**
- [x] 商品を非公開にできること
- [x] 非公開対象の商品が見つからない場合、NotFoundException を throw すること

**addImage**
- [x] 商品に画像を追加できること
- [x] 追加対象の商品が見つからない場合、NotFoundException を throw すること

**deleteImage**
- [x] 画像を削除できること
- [x] 削除対象の画像が見つからない場合、NotFoundException を throw すること
- [x] addImageで urlが空はエラー

---

### ProductsController `backend/src/products/products.controller.spec.ts`

**create**
- [x] POST /admin/products で商品を作成できること

**findAll**
- [x] GET /admin/products で全商品を取得できること

**findById**
- [x] GET /admin/products/:id で商品を取得できること

**update**
- [x] PUT /admin/products/:id で商品を更新できること

**delete**
- [x] DELETE /admin/products/:id で商品を削除できること

**addVariation**
- [x] POST /admin/products/:id/variations でバリエーションを追加できること

---

### Public Products E2E `backend/src/products/public-products.e2e-spec.ts`

**GET /products**
- [x] 公開商品一覧を返すこと
- [x] 非公開商品は含まれないこと
- [x] ページネーション（page, limit）が機能すること
- [x] カテゴリフィルター（category_id）が機能すること
- [x] キーワード検索（keyword）が機能すること
- [x] ソート（sort=price_asc）が機能すること
- [x] ソート（sort=price_desc）が機能すること

**GET /products/:id**
- [x] 商品詳細をバリエーション・画像付きで返すこと
- [x] 存在しない商品は404を返すこと
- [x] 非公開商品は404を返すこと

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
- [x] 正しい認証情報の時、accessTokenを返すこと
- [x] 未登録メールアドレスの時、401を返すこと
- [x] パスワードが不一致の時、401を返すこと
- [x] メールアドレス形式が不正な時、400を返すこと
- [x] 管理者JWTのペイロードに type:'admin' と role が含まれること
- [x] super管理者でログインした時、accessTokenを返すこと

**GET /auth/admin/me**
- [x] 管理者JWTの時、200でid・roleを返すこと
- [x] 会員JWTの時、401を返すこと

**GET /auth/admin/super-only**
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

- [x] 管理者トークンがない時、/admin/loginへリダイレクトすること
- [x] 管理者トークンがある時、リダイレクトしないこと

---

### admin login page `frontend/src/routes/-admin.login.test.tsx`

- [x] 表示時、管理者ログインフォームが表示されること
- [x] 有効な認証情報の時、トークンを保存して/adminへ遷移すること
- [x] 認証に失敗した時、エラーメッセージを表示すること
- [x] レスポンス形式が不正な時、エラーメッセージを表示すること

---

### admin admins page `frontend/src/routes/-_admin.admin.admins.test.tsx`

- [x] 取得成功時、管理者一覧を表示すること
- [x] 取得失敗時、エラーメッセージを表示すること

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
