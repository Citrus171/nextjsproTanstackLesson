# テスト一覧

## バックエンド（Jest）

### AuthService `backend/src/auth/auth.service.spec.ts`

**register**
- [ ] 有効なメールアドレスとパスワードの時、id/emailを返すこと
- [ ] パスワードをレスポンスに含まない

**login**
- [ ] 正しい認証情報でアクセストークンを返す
- [ ] 存在しないメールアドレスはUnauthorizedExceptionを投げる
- [ ] パスワード不一致はUnauthorizedExceptionを投げる
- [ ] メールアドレス/パスワード不一致のエラーメッセージは同一（列挙攻撃対策）

---

### AuthController `backend/src/auth/auth.controller.spec.ts`

**register**
- [ ] 有効な入力の時、ユーザー登録結果を返すこと

**login**
- [ ] 有効な認証情報の時、アクセストークンを返すこと
- [ ] サービスがエラーを投げた時、エラーが伝播すること

---

### JwtStrategy `backend/src/auth/jwt.strategy.spec.ts`

**validate**
- [ ] 有効なJWTペイロードの時、subをidにマッピングしてid/emailを返すこと

---

### Auth DTO `backend/src/auth/dto/auth.dto.spec.ts`

**RegisterDto**
- [ ] 有効なメールアドレスとパスワードの時、エラーがないこと
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

---

### UsersService `backend/src/users/users.service.spec.ts`

**create**
- [ ] 新規ユーザーを作成してパスワードをハッシュ化する
- [ ] 既存メールアドレスはConflictExceptionを投げる
- [ ] ConflictException時はsaveを呼ばない

**findByEmail**
- [ ] 存在するメールアドレスのユーザーを返す
- [ ] 存在しないメールアドレスはnullを返す

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
- [ ] 自己参照リレーション（parent_id FK）が存在すること

---

### ProductEntity `backend/src/products/entities/product.entity.spec.ts`

- [ ] テーブル名がproductsであること
- [ ] nameカラムが存在すること
- [ ] priceカラムがINT型で存在すること
- [ ] stockカラムが存在しないこと（バリエーションで管理）
- [ ] is_publishedカラムがboolean型で存在すること
- [ ] deletedAtカラムが存在すること（論理削除）
- [ ] categoryへのリレーションが存在すること

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

### StoreSettingsEntity `backend/src/store-settings/entities/store-settings.entity.spec.ts`

- [ ] テーブル名がstore_settingsであること
- [ ] invoiceNumberカラムがnullableで存在すること
- [ ] shippingFixedFeeカラムがINT型で存在すること
- [ ] shippingFreeThresholdカラムがINT型で存在すること
