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
### AdminMembersService `backend/src/admin-members/admin-members.service.spec.ts`

**findAll**
- [x] ページネーション付きで会員一覧を返すこと

**findById**
- [x] 存在するユーザーIDの詳細を返すこと
- [x] 存在しないユーザーIDでNotFoundExceptionを投げること

**findOrdersByUserId**
- [x] userIdに紐づく注文を取得すること

**softDelete**
- [x] 存在するIDを論理削除すること
- [x] 存在しないIDではfalseを返すこと

---

### AdminMembersController `backend/src/admin-members/admin-members.controller.spec.ts`

**findAll**
- [x] page/limit付きで会員一覧を返すこと

**findById**
- [x] 管理者会員詳細を返すこと

**delete**
- [x] 存在するIDを削除するとvoidを返すこと

---

### AdminMembers E2E `backend/src/admin-members/admin-members.e2e-spec.ts`

**GET /admin/members**
- [x] ページネーション付き会員一覧を返すこと
- [x] passwordがレスポンスに含まれないこと

**GET /admin/members/:id**
- [x] 注文履歴を含む会員詳細を返すこと
- [x] passwordがレスポンスに含まれないこと

**DELETE /admin/members/:id**
- [x] general管理者は403になること
- [x] super管理者は204で削除できること

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
- [x] 論理削除済み会員はUnauthorizedExceptionを投げること
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
- [x] 有効なJWTペイロードかつ存在するユーザーの時、idを返すこと
- [x] type が "user" でない時、UnauthorizedExceptionを投げること
- [x] 論理削除済みユーザーの時（findByIdがNotFoundExceptionを投げる）、UnauthorizedExceptionを投げること
- [x] DB障害などNotFoundException以外の例外は再throwすること

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
- [x] isPublished: trueを渡したとき、公開状態で商品が作成されること

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
- [x] 新規ユーザーを作成してname・emailを保存しパスワードをハッシュ化する
- [x] 既存メールアドレスはConflictExceptionを投げる
- [x] ConflictException時はsaveを呼ばない

**findByEmail**
- [x] 存在するメールアドレスのユーザーを返す
- [x] 存在しないメールアドレスはnullを返す
- [x] 論理削除済みユーザーはnullを返す（TypeORMが@DeleteDateColumnで自動除外）

**findById**
- [x] 存在するIDのユーザーを返す
- [x] 存在しないIDはNotFoundExceptionを投げる

**changePassword**
- [x] 正しい現在のパスワードの時、新しいパスワードをハッシュ化して保存する
- [x] 現在のパスワードが不一致の時、UnauthorizedExceptionを投げる
- [x] パスワード不一致の時はupdateを呼ばない

**updateProfile**
- [x] name と address を更新して更新済みユーザーを返すこと
- [x] address に null を渡すと住所が削除されること

**findOrdersByUserId**
- [x] ユーザーの注文を createdAt DESC 順で返すこと
- [x] 注文がない場合は空配列を返すこと

**withdraw**
- [x] softDelete でユーザーを論理削除すること

---

### UsersController `backend/src/users/users.controller.spec.ts`

**getMe**
- [x] 認証済みユーザーのプロフィールを返すこと（passwordを除く）
- [x] ユーザーが存在しない時、NotFoundExceptionが伝播すること

**changePassword**
- [x] 正しい現在のパスワードの時、204を返すこと
- [x] 現在のパスワードが不一致の時、UnauthorizedExceptionが伝播すること

**updateProfile**
- [x] 更新済みプロフィールを返すこと（passwordを除く）
- [x] address が undefined の時は null として渡すこと

**getOrders**
- [x] 注文一覧をOrderSummaryDto形式（id/status/totalAmount/createdAtのみ）で返すこと
- [x] 注文がない場合は空配列を返すこと

**withdraw**
- [x] 退会成功時に undefined を返すこと

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

### StoreSettingsService `backend/src/store-settings/store-settings.service.spec.ts`

**getSettings**
- [x] 店舗設定が存在するとき、その設定を返すこと
- [x] 店舗設定が存在しないとき、エラーを投げること

**updateSettings**
- [x] invoiceNumberを更新できること
- [x] invoiceNumberをnullに更新できること
- [x] shippingFixedFeeを更新できること
- [x] shippingFreeThresholdを更新できること
- [x] shippingFixedFeeが0以下の場合エラーを投げること
- [x] shippingFixedFeeが負数の場合エラーを投げること
- [x] shippingFreeThresholdが0以下の場合エラーを投げること
- [x] shippingFreeThresholdが負数の場合エラーを投げること
- [x] 複数フィールドを同時に更新できること
- [x] 大きな数値（超大値）も受け入れること
- [x] 1円の設定も受け入れること（境界値）

---

### StoreSettingsController `backend/src/store-settings/store-settings.controller.spec.ts`

**getSettings**
- [x] 店舗設定を返すこと
- [x] invoiceNumberがnullの場合も返すこと

**updateSettings**
- [x] invoiceNumberを更新できること
- [x] shippingFixedFeeを更新できること
- [x] shippingFreeThresholdを更新できること
- [x] バリデーション失敗時、サービスがエラーを投げること
- [x] 複数フィールドを同時に更新できること

---

### StoreSettings E2E `backend/src/store-settings/store-settings.e2e-spec.ts`

**GET /admin/store-settings**
- [x] super管理者がアクセスできること
- [x] 一般管理者がアクセスできること
- [x] トークンなしでアクセスできないこと
- [x] 無効なトークンでアクセスできないこと

**PUT /admin/store-settings**
- [x] super管理者が更新できること
- [x] 一般管理者は更新できないこと
- [x] トークンなしでアクセスできないこと
- [x] 無効なトークンでアクセスできないこと
- [x] バリデーション失敗（配送料0円）
- [x] バリデーション失敗（無料閾値負数）

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

### admin store settings page `frontend/src/routes/-_admin.admin.settings.test.tsx`

- [x] 設定取得成功時、現在の設定値をフォームに表示すること
- [x] 設定取得失敗時、エラーメッセージを表示すること
- [x] super管理者がフォームを送信すると、設定が更新されること
- [x] PUT失敗時、エラーメッセージを表示すること
- [x] 配送料に0を入力すると、バリデーションエラーを表示すること
- [x] JWTトークンのデコードに失敗した場合、エラーメッセージを表示すること
- [x] 更新APIのレスポンス形式が不正な場合、エラーメッセージを表示すること

---

### admin members page `frontend/src/routes/-_admin.admin.members.test.tsx`

- [x] 会員一覧が表示されること
- [x] 詳細表示と削除操作が動作すること
- [x] 会員一覧の取得に失敗したとき、エラーメッセージが表示されること
- [x] 会員詳細の取得に失敗したとき、エラーメッセージが表示されること
- [x] 会員削除に失敗したとき、エラーメッセージが表示されること

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

- [x] childrenが描画されること

---

## Issue#11 カート機能

### CartsService `backend/src/carts/carts.service.spec.ts`

**getCart**
- [x] セッションIDに対応するカートアイテムを返すこと
- [x] カートが空の場合は空配列を返すこと

**addToCart**
- [x] 在庫があるバリエーションをカートに追加できること
- [x] 在庫をquantity分減算すること
- [x] 同一セッション・同一バリエーション再追加時はquantityを加算すること
- [x] 在庫不足時はConflictExceptionを投げること
- [x] 存在しないバリエーションはNotFoundExceptionを投げること

**updateItem**
- [x] 数量を増加した場合に在庫を差分だけ減算すること
- [x] 数量を減少した場合に在庫を差分だけ加算すること
- [x] 増加後に在庫不足ならConflictExceptionを投げること
- [x] 他セッションのカートアイテムはForbiddenExceptionを投げること
- [x] 存在しないカートアイテムはNotFoundExceptionを投げること

**removeItem**
- [x] 削除時に在庫をquantityだけ加算すること
- [x] 他セッションのアイテムはForbiddenExceptionを投げること

**releaseExpiredCarts**
- [x] 期限切れカートの在庫を返却すること
- [x] 期限切れカートのstatusをexpiredに更新すること
- [x] 期限切れでないカートは処理しないこと

---

### CartsController `backend/src/carts/carts.controller.spec.ts`

- [x] getCartがCartsServiceのgetCartメソッドを呼ぶこと
- [x] addToCartがCartsServiceのaddToCartメソッドを呼ぶこと
- [x] updateItemがCartsServiceのupdateItemメソッドを呼ぶこと
- [x] removeItemがCartsServiceのremoveItemメソッドを呼ぶこと

---

### Cart Page `frontend/src/routes/-_authenticated.cart.test.tsx`

- [x] カートアイテムが一覧表示されること
- [x] 空カート時にメッセージが表示されること
- [x] 削除ボタンクリックでremoveItemが呼ばれること

---

---

## Issue#12 チェックアウト・Stripe決済

### PaymentsService `backend/src/payments/payments.service.spec.ts`

**createCheckoutSession**
- [x] カートが空の場合はBadRequestExceptionを投げること
- [x] カート合計が閾値未満の場合は固定配送料を加算すること
- [x] カート合計が閾値以上の場合は配送料が無料になること
- [x] Stripe Checkout SessionのURLを返すこと
- [x] pendingステータスで注文レコードを作成すること
- [x] 購入時点の価格スナップショットをorder_itemsに保存すること

**handleWebhook**
- [x] 無効なStripe署名の場合はBadRequestExceptionを投げること
- [x] checkout.session.completed以外のイベントは無視して200を返すこと
- [x] 処理済みのevent_idは二重処理しないこと
- [x] checkout.session.completed受信後に注文ステータスをpaidにすること
- [x] checkout.session.completed受信後にカートをpurchasedに更新すること
- [x] 処理後にstripe_eventsにevent_idをINSERTすること
- [x] checkout.session.completed受信後にメール送信が呼ばれること
- [x] メール送信が失敗してもWebhookが正常完了すること
- [x] 無効署名の時はメール送信が呼ばれないこと
- [x] checkout.session.completed以外のイベントはメール送信されないこと

---

### MailService `backend/src/mail/mail.service.spec.ts`

**sendOrderConfirmation**
- [x] 注文したユーザーのメールアドレスに送信されること
- [x] 件名に注文番号が含まれること
- [x] order-confirmation テンプレートが使用されること
- [x] テンプレートに注文番号・商品一覧・配送料・合計・配送先が渡されること

---

### PaymentsController `backend/src/payments/payments.controller.spec.ts`

**createCheckoutSession**
- [x] checkout URLを返すこと
- [x] カートが空の場合はBadRequestExceptionが伝播すること

**handleWebhook**
- [x] Stripe-Signatureヘッダーをサービスに渡すこと
- [x] 署名検証失敗時はBadRequestExceptionが伝播すること

---

### CheckoutPage `frontend/src/routes/-_authenticated.checkout.test.tsx`

- [x] 配送先フォームが表示されること
- [x] フォーム送信でcheckout APIが呼ばれStripeにリダイレクトすること
- [x] 必須フィールドが空の場合はバリデーションエラーが表示されること
- [x] API エラー時にエラートーストが表示されること
- [x] 送信中はボタンが「処理中...」になること

---

### CheckoutCompletePage `frontend/src/routes/-_authenticated.checkout.complete.test.tsx`

- [x] 注文完了メッセージが表示されること
- [x] 確認メール送信の案内が表示されること
- [x] トップページへのリンクが表示されること

---

### AdminOrdersService `backend/src/admin-orders/admin-orders.service.spec.ts`

**findAll**
- [x] ページネーション付きで注文一覧（ユーザー情報含む）を返すこと
- [x] page=2,limit=10の時スキップ量が10になること
- [x] ステータスフィルターが指定された場合、そのステータスで絞り込むこと

**findById**
- [x] 存在する注文IDの詳細（商品明細・配送先・ユーザー情報）を返すこと
- [x] 存在しない注文IDではNotFoundExceptionを投げること

**updateStatus**
- [x] paid→shippedへの遷移が成功すること
- [x] shipped→deliveredへの遷移が成功すること
- [x] 不正遷移（delivered→shipped）はBadRequestExceptionを投げること
- [x] 不正遷移（paid→delivered）はBadRequestExceptionを投げること
- [x] 存在しない注文IDではNotFoundExceptionを投げること

**cancelOrder**
- [x] paidの注文をcancelledにしStripe返金後refundedになること
- [x] shippedの注文もStripe返金してrefundedになること
- [x] pendingの注文はStripe返金なしでcancelledになること
- [x] pendingでstripeSessionIdがあっても返金しないこと
- [x] payment_statusがpaidでない場合はcancelledのまま返金しないこと
- [x] Stripe返金APIが失敗した場合、InternalServerErrorExceptionを投げること
- [x] sessions.retrieve が失敗した場合、InternalServerErrorExceptionを投げること
- [x] deliveredの注文はキャンセル不可でBadRequestExceptionを投げること
- [x] 存在しない注文IDではNotFoundExceptionを投げること

---

### AdminOrdersController `backend/src/admin-orders/admin-orders.controller.spec.ts`

**findAll**
- [x] page/limit付きで注文一覧を返すこと
- [x] statusフィルターが指定された場合サービスへ渡すこと

**findById**
- [x] 注文詳細を返すこと

**updateStatus**
- [x] ステータス更新をサービスに委譲してvoidを返すこと

**cancelOrder**
- [x] キャンセルをサービスに委譲してvoidを返すこと

---

### Payments E2E `backend/src/payments/payments.e2e-spec.ts`

**POST /payments/checkout**
- [x] JWTなしで401を返すこと
- [x] カートが空のユーザーがリクエストすると400を返すこと
- [x] カートに商品があるユーザーがリクエストするとStripe checkout URLを返すこと

**POST /payments/webhook**
- [x] 無効なStripe署名の場合400を返すこと
- [x] checkout.session.completed以外のイベントは無視して200を返すこと
- [x] checkout.session.completedで注文ステータスがpaidに更新されること
- [x] checkout.session.completedでカートがpurchasedに更新されること
- [x] 同一イベントIDを2回受信しても二重処理しないこと（冪等性）

---

### AdminOrdersPage `frontend/src/routes/-_admin.admin.orders.test.tsx`

- [x] 注文一覧が表示されること
- [x] 詳細ボタンで注文詳細が表示されること
- [x] ステータス更新ボタンで発送済みに変更でき、詳細が再取得されること
- [x] キャンセル・返金ボタンで注文をキャンセルでき、詳細が再取得されること
- [x] 注文一覧の取得に失敗したとき、エラーメッセージが表示されること
- [x] 注文詳細の取得に失敗したとき、エラーメッセージが表示されること
- [x] 詳細取得に失敗したとき、前回の詳細が残らないこと
- [x] ステータス更新に失敗したとき、エラーメッセージが表示されること
- [x] キャンセルに失敗したとき、エラーメッセージが表示されること
- [x] pending状態の注文でもキャンセルボタンが表示されること

---

## レイアウト・共有コンポーネント

### MemberLayout `frontend/src/components/layouts/MemberLayout.test.tsx`

**未認証の場合**
- [x] ロゴが表示されること
- [x] 商品一覧リンクが表示されること
- [x] カートリンクが表示されること
- [x] ログインリンクが表示されること
- [x] マイページリンクが表示されないこと
- [x] フッターにコピーライトが表示されること
- [x] childrenが描画されること

**認証済みの場合**
- [x] マイページリンクが表示されること
- [x] マイページリンクのhrefが /my-page であること
- [x] ログインリンクが表示されないこと

---

### MyPage `frontend/src/components/pages/MyPage.test.tsx`

- [x] プロフィールが表示されること
- [x] メールアドレス入力欄が disabled であること
- [x] 注文履歴が表示されること
- [x] 注文がない場合「まだ注文はありません」が表示されること
- [x] プロフィール保存成功時に成功メッセージが表示されること
- [x] プロフィール保存失敗時にエラーメッセージが表示されること
- [x] 退会ボタンを押すと確認ダイアログが表示されること
- [x] 退会成功時にトークンを削除してログインページへリダイレクトすること
- [x] 退会失敗時にエラーメッセージがダイアログ内に表示されること
- [x] 読み込み中は「読み込み中...」が表示されること

---

### AdminProductsPage `frontend/src/routes/-_admin.admin.products.test.tsx`

**商品一覧表示**
- [x] 商品一覧が表示されること
- [x] 公開状態がラベルで表示されること
- [x] API取得失敗時にエラーメッセージが表示されること

**商品登録**
- [x] 「商品登録」ボタンをクリックするとフォームが表示されること
- [x] 商品登録フォームを送信すると登録APIが呼ばれること
- [x] 商品登録失敗時にエラーメッセージが表示されること

**商品編集**
- [x] 「編集」ボタンをクリックすると編集フォームが表示されること
- [x] 編集フォームを送信すると更新APIが呼ばれること

**商品削除**
- [x] 「削除」ボタンをクリックして確認するとAPIが呼ばれること
- [x] 削除確認でキャンセルするとAPIが呼ばれないこと

**公開切り替え**
- [x] 「公開する」ボタンをクリックすると公開APIが呼ばれること
- [x] 「非公開にする」ボタンをクリックすると非公開APIが呼ばれること

**バリエーション**
- [x] 「バリエーション」ボタンをクリックするとバリエーション一覧が表示されること
- [x] バリエーション追加フォームを送信するとAPIが呼ばれること
- [x] バリエーション削除ボタンをクリックするとAPIが呼ばれること

**カテゴリ選択**
- [x] 商品登録フォームにカテゴリ選択肢が表示されること
- [x] 商品登録フォームでカテゴリを選択して登録するとAPIにcategoryIdが渡されること
- [x] 商品編集フォームにカテゴリ選択肢が表示されること

**公開状態**
- [x] 商品登録フォームに公開状態チェックボックスが表示されること
- [x] 公開チェックをオンにして登録するとAPIにisPublished:trueが渡されること

**画像管理**
- [x] 画像管理ボタンをクリックすると画像セクションが表示されること
- [x] 画像URLを入力して追加するとAPIが呼ばれること
- [x] 画像削除ボタンをクリックするとAPIが呼ばれること
- [x] 「バリエーション」ボタンを2回クリックするとバリエーション一覧が非表示になること
- [x] 「画像」ボタンを2回クリックすると画像セクションが非表示になること
- [x] 画像がない商品の画像セクションを開くと「画像がありません」と表示されること
- [x] 画像追加に失敗した場合エラーメッセージが表示されること
- [x] 画像削除に失敗した場合エラーメッセージが表示されること

---

### ProductsPage `frontend/src/routes/-_authenticated.products.index.test.tsx`

**商品一覧表示**
- [x] 商品名・価格・カテゴリが表示されること
- [x] API取得失敗時にエラーメッセージが表示されること
- [x] ローディング中は読み込み中テキストが表示されること

**キーワード検索**
- [x] キーワード入力時に検索パラメータ付きでAPIが呼ばれること

**カテゴリフィルタ**
- [x] カテゴリセレクトが表示されること
- [x] カテゴリ選択時にcategory_idパラメータ付きでAPIが呼ばれること

**ソート**
- [x] ソートセレクトが表示されること
- [x] ソート変更時にsortパラメータ付きでAPIが呼ばれること

**商品詳細リンク**
- [x] 商品名をクリックすると詳細ページへのリンクになっていること

**データ形式エラー**
- [x] APIが不正な形式のデータを返した場合にエラーメッセージが表示されること

---

### ProductsPage `frontend/src/routes/-_authenticated.products.test.tsx`

- [x] 商品一覧が表示されること
- [x] 商品価格が表示されること
- [x] カテゴリ名が表示されること
- [x] API取得失敗時にエラーメッセージが表示されること
- [x] 検索フォームを送信するとAPIが呼ばれること
- [x] 並び替え変更するとAPIが呼ばれること
- [x] 商品が0件の時「見つかりませんでした」が表示されること

---

### ProductDetailPage `frontend/src/routes/-_authenticated.products.$productId.test.tsx`

- [x] 商品名・説明・価格が表示されること
- [x] カテゴリ名が表示されること
- [x] 論理削除済みバリエーションは表示されないこと
- [x] 在庫0のバリエーションは無効で表示されること
- [x] バリエーションを選択するとaria-pressedがtrueになること
- [x] バリエーション未選択時はカートに追加ボタンが無効なこと
- [x] バリエーションを選択してカートに追加するとAPIが呼ばれること
- [x] カート追加失敗時にエラートーストが表示されること
- [x] API取得失敗時にエラーメッセージが表示されること
- [x] 数量を増減できること
- [x] 商品一覧へのパンくずが表示されること
- [x] バリエーション切り替え時に数量が在庫上限にクランプされること
- [x] productId変更時に選択バリエーションと数量がリセットされること
