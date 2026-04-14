# テスト一覧（ツリー形式）

```
nestjspro/
└── backend/
    └── src/
        ├── auth/
        │   ├── auth.e2e-spec.ts
        │   │   ├── POST /auth/register
        │   │   │   ├── 有効な入力の時、ユーザーを作成してid/emailを返すこと
        │   │   │   ├── メールアドレス形式が不正な時、400を返すこと
        │   │   │   ├── パスワードが8文字未満の時、400を返すこと
        │   │   │   └── 同じメールアドレスが既に存在する時、409を返すこと
        │   │   ├── POST /auth/login
        │   │   │   ├── 正しい認証情報の時、accessTokenを返すこと
        │   │   │   ├── 未登録メールアドレスの時、401を返すこと
        │   │   │   ├── パスワードが不一致の時、401を返すこと
        │   │   │   └── メールアドレス形式が不正な時、400を返すこと
        │   │   └── POST /auth/admin/login
        │   │       ├── 正しい認証情報の時、accessTokenを返すこと
        │   │       ├── 未登録メールアドレスの時、401を返すこと
        │   │       ├── パスワードが不一致の時、401を返すこと
        │   │       ├── メールアドレス形式が不正な時、400を返すこと
        │   │       ├── 管理者JWTのペイロードに type:'admin' と role が含まれること
        │   │       └── super管理者でログインした時、accessTokenを返すこと
        │   │   ├── GET /auth/admin/me
        │   │   │   ├── 管理者JWTの時、200でid・roleを返すこと
        │   │   │   └── 会員JWTの時、401を返すこと
        │   │   └── GET /auth/admin/super-only
        │   │       ├── general管理者JWTの時、403を返すこと
        │   │       └── super管理者JWTの時、200を返すこと
        │   ├── auth.service.spec.ts
        │   │   ├── register
        │   │   │   ├── 有効なname・メールアドレス・パスワードの時、id/emailを返すこと
        │   │   │   ├── nameをusersService.create()に渡すこと
        │   │   │   └── パスワードをレスポンスに含まない
        │   │   ├── login
        │   │   │   ├── 正しい認証情報でアクセストークンを返す
        │   │   │   ├── JWTペイロードに type:"user" と sub が含まれること
        │   │   │   ├── 存在しないメールアドレスはUnauthorizedExceptionを投げる
        │   │   │   ├── パスワード不一致はUnauthorizedExceptionを投げる
        │   │   │   ├── 論理削除済み会員はUnauthorizedExceptionを投げること ✓
        │   │   │   └── メールアドレス/パスワード不一致のエラーメッセージは同一（列挙攻撃対策）
        │   │   └── adminLogin
        │   │       ├── 正しい認証情報でアクセストークンを返す
        │   │       ├── JWTペイロードに type:"admin"・sub・role が含まれること
        │   │       ├── 存在しないメールアドレスはUnauthorizedExceptionを投げる
        │   │       ├── パスワード不一致はUnauthorizedExceptionを投げる
        │   │       └── メールアドレス/パスワード不一致のエラーメッセージは同一（列挙攻撃対策）
        │   ├── auth.controller.spec.ts
        │   │   ├── register
        │   │   │   └── 有効な入力の時、nameをサービスに渡してユーザー登録結果を返すこと
        │   │   ├── login
        │   │   │   ├── 有効な認証情報の時、アクセストークンを返すこと
        │   │   │   └── サービスがエラーを投げた時、エラーが伝播すること
        │   │   ├── adminLogin
        │   │   │   ├── 有効な認証情報の時、adminLoginサービスを呼びアクセストークンを返すこと
        │   │   │   └── サービスがエラーを投げた時、エラーが伝播すること
        │   │   ├── adminMe
        │   │   │   └── 認証済み管理者のidとroleを返すこと
        │   │   └── superOnly
        │   │       └── 到達した時、ok:trueを返すこと
        │   ├── dto/
        │   │   └── auth.dto.spec.ts
        │   │       ├── RegisterDto
        │   │       │   ├── 有効なname・メールアドレス・パスワードの時、エラーがないこと
        │   │       │   ├── nameが空文字の時、nameがエラーになること
        │   │       │   ├── nameが省略された時、nameがエラーになること
        │   │       │   ├── メールアドレス形式が不正な時、emailがエラーになること
        │   │       │   └── パスワードが8文字未満の時、passwordがエラーになること
        │   │       └── LoginDto
        │   │           ├── 有効なメールアドレスとパスワードの時、エラーがないこと
        │   │           ├── メールアドレス形式が不正な時、emailがエラーになること
        │   │           └── パスワードが空文字の時、passwordがエラーになること
        │   ├── jwt.strategy.spec.ts ✓
        │   │   └── validate
        │   │       ├── 有効なJWTペイロードかつ存在するユーザーの時、idを返すこと ✓
        │   │       ├── type が "user" でない時、UnauthorizedExceptionを投げること ✓
        │   │       ├── 論理削除済みユーザーの時（findByIdがNotFoundExceptionを投げる）、UnauthorizedExceptionを投げること ✓
        │   │       └── DB障害などNotFoundException以外の例外は再throwすること ✓
        │   └── guards/
        │       └── super-admin.guard.spec.ts
        │           ├── superロールの時、アクセスを許可すること
        │           ├── generalロールの時、ForbiddenExceptionを投げること
        │           └── roleが存在しない時、ForbiddenExceptionを投げること
        │   └── strategies/
        │       └── admin-jwt.strategy.spec.ts
        │           └── validate
        │               ├── 有効な管理者JWTペイロードの時、id・roleをマッピングして返すこと
        │               ├── generalロールの場合もid・roleを返すこと
        │               └── type が "admin" でない時、UnauthorizedExceptionを投げること
        ├── admin-users/
        │   ├── admin-users.service.spec.ts
        │   │   ├── findByEmail
        │   │   │   ├── 存在するメールアドレスの時、AdminUserEntityを返すこと ✓
        │   │   │   └── 存在しないメールアドレスの時、nullを返すこと ✓
        │   │   ├── create
        │   │   │   └── 有効な情報でアカウント作成され、id・email・role・createdAtを返すこと ✓
        │   │   ├── findAll
        │   │   │   └── 全管理者を取得され、createdAtが新しい順に並ぶこと ✓
        │   │   ├── findById
        │   │   │   ├── 存在するIDで詳細取得でき、passwordを含まないこと ✓
        │   │   │   └── 存在しないIDで詳細取得した時、nullを返すこと ✓
        │   │   ├── update
        │   │   │   ├── 有効な更新内容でアカウント更新され、更新後の情報を返すこと ✓
        │   │   │   └── 存在しないIDで更新した時、nullを返すこと ✓
        │   │   ├── softDelete
        │   │   │   ├── 存在するIDで論理削除に成功すること ✓
        │   │   │   └── 存在しないIDで論理削除した時、何も起こらないこと ✓
        │   │   └── 業務ルール・例外ケース
        │   │       ├── email一意性制約違反時、エラーが伝搬すること ✓
        │   │       ├── ロール値は super または general のみ許可（型安全） ✓
        │   │       └── 更新時、部分的な更新（nameのみ）でroleは変更されないこと ✓
        │   ├── admin-accounts.controller.spec.ts
        │   │   ├── create
        │   │   │   └── 有効なDTOでアカウント作成され、レスポンスを返すこと ✓
        │   │   ├── findAll
        │   │   │   └── 全管理者一覧を返すこと ✓
        │   │   ├── findById
        │   │   │   ├── 指定IDの管理者詳細を返すこと ✓
        │   │   │   └── 存在しないID時、NotFoundException投げること ✓
        │   │   ├── update
        │   │   │   ├── 有効なDTOでアカウント更新され、更新後レスポンスを返すこと ✓
        │   │   │   └── 存在しないID時、NotFoundException投げること ✓
        │   │   └── delete
        │   │       ├── 指定IDのアカウントを論理削除すること ✓
        │   │       └── 存在しないID時、NotFoundException投げること ✓
        │   ├── dto/
        │   │   └── admin-user.dto.spec.ts
        │   │       ├── CreateAdminUserDto
        │   │       │   ├── 有効なDTOでバリデーション成功すること ✓
        │   │       │   ├── nameがない時、バリデーションエラー ✓
        │   │       │   ├── emailが無効形式時、バリデーションエラー ✓
        │   │       │   ├── passwordが8文字未満時、バリデーションエラー ✓
        │   │       │   ├── roleが super でも general でもない時、バリデーションエラー ✓
        │   │       │   └── general ロール も有効 ✓
        │   │       └── UpdateAdminUserDto
        │   │           ├── 全フィールド省略可能（空オブジェクト）でバリデーション成功 ✓
        │   │           ├── nameのみ更新 ✓
        │   │           ├── roleのみ更新 ✓
        │   │           ├── roleが無効値の場合、バリデーションエラー ✓
        │   │           └── nameとroleの両方更新 ✓
        │   └── entities/
        │       └── admin-user.entity.spec.ts
        │           ├── テーブル名がadmin_usersであること
        │           ├── emailカラムがunique制約付きで存在すること
        │           ├── passwordカラムが存在すること
        │           ├── nameカラムが存在すること
        │           ├── roleカラムがenum('super','general')で存在すること
        │           └── deletedAtカラムが存在すること（論理削除）
        ├── admin-members/
        │   ├── admin-members.service.spec.ts
        │   │   ├── findAll
        │   │   │   └── ページネーション付きで会員一覧を返すこと ✓
        │   │   ├── findById
        │   │   │   ├── 存在するユーザーIDの詳細を返すこと ✓
        │   │   │   └── 存在しないユーザーIDでNotFoundExceptionを投げること ✓
        │   │   ├── findOrdersByUserId
        │   │   │   └── userIdに紐づく注文を取得すること ✓
        │   │   └── softDelete
        │   │       ├── 存在するIDを論理削除すること ✓
        │   │       └── 存在しないIDではfalseを返すこと ✓
        │   ├── admin-members.controller.spec.ts
        │   │   ├── findAll
        │   │   │   └── page/limit付きで会員一覧を返すこと ✓
        │   │   ├── findById
        │   │   │   └── 管理者会員詳細を返すこと ✓
        │   │   └── delete
        │   │       └── 存在するIDを削除するとvoidを返すこと ✓
        │   └── admin-members.e2e-spec.ts
        │       ├── GET /admin/members
        │       │   ├── ページネーション付き会員一覧を返すこと ✓
        │       │   └── passwordがレスポンスに含まれないこと ✓
        │       ├── GET /admin/members/:id
        │       │   ├── 注文履歴を含む会員詳細を返すこと ✓
        │       │   └── passwordがレスポンスに含まれないこと ✓
        │       └── DELETE /admin/members/:id
        │           ├── general管理者は403になること ✓
        │           └── super管理者は204で削除できること ✓
        ├── users/
        │   ├── users.controller.spec.ts ✓
        │   │   ├── getMe
        │   │   │   ├── 認証済みユーザーのプロフィールを返すこと（passwordを除く） ✓
        │   │   │   └── ユーザーが存在しない時、NotFoundExceptionが伝播すること ✓
        │   │   ├── changePassword
        │   │   │   ├── 正しい現在のパスワードの時、204を返すこと ✓
        │   │   │   └── 現在のパスワードが不一致の時、UnauthorizedExceptionが伝播すること ✓
        │   │   ├── updateProfile
        │   │   │   ├── 更新済みプロフィールを返すこと（passwordを除く） ✓
        │   │   │   └── address が undefined の時は null として渡すこと ✓
        │   │   ├── getOrders
        │   │   │   ├── 注文一覧をOrderSummaryDto形式（id/status/totalAmount/createdAtのみ）で返すこと ✓
        │   │   │   └── 注文がない場合は空配列を返すこと ✓
        │   │   └── withdraw
        │   │       └── 退会成功時に undefined を返すこと ✓
        │   ├── users.service.spec.ts ✓
        │   │   ├── create
        │   │   │   ├── 新規ユーザーを作成してname・emailを保存しパスワードをハッシュ化する ✓
        │   │   │   ├── 既存メールアドレスはConflictExceptionを投げる ✓
        │   │   │   └── ConflictException時はsaveを呼ばない ✓
        │   │   ├── findByEmail
        │   │   │   ├── 存在するメールアドレスのユーザーを返す ✓
        │   │   │   ├── 存在しないメールアドレスはnullを返す ✓
        │   │   │   └── 論理削除済みユーザーはnullを返す（TypeORMが@DeleteDateColumnで自動除外） ✓
        │   │   ├── findById
        │   │   │   ├── 存在するIDのユーザーを返す ✓
        │   │   │   └── 存在しないIDはNotFoundExceptionを投げる ✓
        │   │   ├── changePassword
        │   │   │   ├── 正しい現在のパスワードの時、新しいパスワードをハッシュ化して保存する ✓
        │   │   │   ├── 現在のパスワードが不一致の時、UnauthorizedExceptionを投げる ✓
        │   │   │   └── パスワード不一致の時はupdateを呼ばない ✓
        │   │   ├── updateProfile
        │   │   │   ├── name と address を更新して更新済みユーザーを返すこと ✓
        │   │   │   └── address に null を渡すと住所が削除されること ✓
        │   │   ├── findOrdersByUserId
        │   │   │   ├── ユーザーの注文を createdAt DESC 順で返すこと ✓
        │   │   │   └── 注文がない場合は空配列を返すこと ✓
        │   │   └── withdraw
        │   │       └── softDelete でユーザーを論理削除すること ✓
        │   └── entities/
        │       └── user.entity.spec.ts
        │           ├── テーブル名がusersであること
        │           ├── idカラムが存在すること（PrimaryGeneratedColumn）
        │           ├── emailカラムがunique制約付きで存在すること
        │           ├── passwordカラムが存在すること
        │           ├── nameカラムが存在すること
        │           ├── addressカラムが存在すること
        │           └── deletedAtカラムが存在すること（論理削除）
        ├── categories/
        │   ├── categories.service.spec.ts
        │   │   ├── findAll
        │   │   │   └── 全カテゴリを親子構造で返すこと ✓
        │   │   ├── create
        │   │   │   ├── parentIdが指定される場合、親カテゴリが存在することを確認すること ✓
        │   │   │   ├── 親が存在する場合はカテゴリを作成すること ✓
        │   │   │   └── parentIdが指定されない場合は親カテゴリなしで作成すること ✓
        │   │   ├── findById
        │   │   │   ├── 存在するカテゴリを返すこと ✓
        │   │   │   └── 存在しないカテゴリはnullを返すこと ✓
        │   │   ├── update
        │   │   │   ├── 存在するカテゴリを更新できること ✓
        │   │   │   ├── 存在しないカテゴリはnullを返すこと ✓
        │   │   │   └── 更新時に親カテゴリが存在することを確認すること ✓
        │   │   └── remove
        │   │       ├── 商品が紐付いている場合はConflictExceptionをスローすること ✓
        │   │       └── 商品がない場合は削除できること ✓
        │   ├── admin-categories.controller.spec.ts
        │   │   ├── findAll
        │   │   │   └── 全カテゴリを返すこと ✓
        │   │   ├── create
        │   │   │   └── 新規カテゴリを作成すること ✓
        │   │   ├── update
        │   │   │   ├── 存在するカテゴリを更新すること ✓
        │   │   │   └── 存在しないカテゴリではNotFoundExceptionをスローすること ✓
        │   │   └── remove
        │   │       └── カテゴリを削除すること ✓
        │   ├── categories.controller.spec.ts
        │   │   └── findAll
        │   │       └── 全カテゴリを親子構造で返すこと ✓
        │   ├── dto/
        │   │   └── category.dto.spec.ts
        │   │       ├── CreateCategoryDto
        │   │       │   ├── nameが50文字以内の時、バリデーション成功すること ✓
        │   │       │   ├── nameが空の場合はバリデーションエラーになること ✓
        │   │       │   ├── nameが50文字超の場合はバリデーションエラーになること ✓
        │   │       │   ├── parentIdが省略可能であること ✓
        │   │       │   ├── parentIdがnullでもバリデーションエラーにならないこと ✓
        │   │       │   └── parentIdが整数の場合はバリデーションエラーにならないこと ✓
        │   │       └── UpdateCategoryDto
        │   │           ├── 空のオブジェクトでもバリデーションエラーにならないこと ✓
        │   │           ├── nameが50文字超の場合はバリデーションエラーになること ✓
        │   │           └── nameとparentIdの両方が指定されてもバリデーションエラーにならないこと ✓
        │   └── entities/
        │       └── category.entity.spec.ts
        │           ├── テーブル名がcategoriesであること
        │           ├── nameカラムが存在すること
        │           ├── parentIdカラムがnullableで存在すること
        │           └── 自己参照リレーション（parentId FK）が存在すること
        ├── products/
        │   ├── products.service.spec.ts
        │   │   ├── create
        │   │   │   ├── 基本情報でプロダクトを作成できること ✓
        │   │   │   ├── categoryIdが指定されたとき、カテゴリが存在すること ✓
        │   │   │   ├── categoryIdが存在しない場合、NotFoundException を throw すること ✓
        │   │   │   ├── nameが空の場合、BadRequestException を throw すること ✓
        │   │   │   └── priceが100未満の場合、BadRequestException を throw すること ✓
        │   │   ├── findById
        │   │   │   ├── IDで商品を取得できること ✓
        │   │   │   └── IDが見つからない場合、NotFoundException を throw すること ✓
        │   │   ├── findAll
        │   │   │   └── 全商品を取得できること ✓
        │   │   ├── update
        │   │   │   ├── 商品情報を更新できること ✓
        │   │   │   ├── 更新するカテゴリが存在しない場合、NotFoundException を throw すること ✓
        │   │   │   ├── 更新対象の商品が見つからない場合、NotFoundException を throw すること ✓
        │   │   │   ├── updateで nameが長すぎる場合はエラー ✓
        │   │   │   ├── updateで priceが最大値超過はエラー ✓
        │   │   │   ├── updateで nameが空の場合はエラー ✓
        │   │   │   └── updateで price が最小値未満はエラー ✓
        │   │   ├── delete
        │   │   │   ├── 商品を論理削除できること ✓
        │   │   │   └── 削除対象の商品が見つからない場合、NotFoundException を throw すること ✓
        │   │   ├── addVariation
        │   │   │   ├── バリエーションを商品に追加できること ✓
        │   │   │   ├── バリエーション追加時にsizeが空の場合、BadRequestException を throw すること ✓
        │   │   │   ├── バリエーション追加時にpriceが100未満の場合、BadRequestException を throw すること ✓
        │   │   │   ├── addVariationで stockが負数はエラー ✓
        │   │   │   ├── addVariationで priceが最大値超過はエラー ✓
        │   │   │   ├── addVariationで colorが空はエラー ✓
        │   │   │   └── addVariationで sizeが空はエラー ✓
        │   │   ├── updateVariation
        │   │   │   ├── バリエーションを更新できること ✓
        │   │   │   ├── 更新対象のバリエーションが見つからない場合、NotFoundException を throw すること ✓
        │   │   │   ├── updateVariationで priceが最小値未満はエラー ✓
        │   │   │   └── updateVariationで sizeが長すぎるはエラー ✓
        │   │   ├── deleteVariation
        │   │   │   ├── バリエーションを削除できること ✓
        │   │   │   └── 削除対象のバリエーションが見つからない場合、NotFoundException を throw すること ✓
        │   │   ├── publish
        │   │   │   ├── 商品を公開できること ✓
        │   │   │   └── 公開対象の商品が見つからない場合、NotFoundException を throw すること ✓
        │   │   ├── unpublish
        │   │   │   ├── 商品を非公開にできること ✓
        │   │   │   └── 非公開対象の商品が見つからない場合、NotFoundException を throw すること ✓
        │   │   ├── addImage
        │   │   │   ├── 商品に画像を追加できること ✓
        │   │   │   └── 追加対象の商品が見つからない場合、NotFoundException を throw すること ✓
        │   │   └── deleteImage
        │   │       ├── 画像を削除できること ✓
        │   │       ├── 削除対象の画像が見つからない場合、NotFoundException を throw すること ✓
        │   │       └── addImageで urlが空はエラー ✓
        │   ├── products.controller.spec.ts
        │   │   ├── create
        │   │   │   └── POST /admin/products で商品を作成できること ✓
        │   │   ├── findAll
        │   │   │   └── GET /admin/products で全商品を取得できること ✓
        │   │   ├── findById
        │   │   │   └── GET /admin/products/:id で商品を取得できること ✓
        │   │   ├── update
        │   │   │   └── PUT /admin/products/:id で商品を更新できること ✓
        │   │   ├── delete
        │   │   │   └── DELETE /admin/products/:id で商品を削除できること ✓
        │   │   └── addVariation
        │   │       └── POST /admin/products/:id/variations でバリエーションを追加できること ✓
        │   ├── public-products.e2e-spec.ts
        │   │   ├── GET /products
        │   │   │   ├── 公開商品一覧を返すこと ✓
        │   │   │   ├── 非公開商品は含まれないこと ✓
        │   │   │   ├── ページネーション（page, limit）が機能すること ✓
        │   │   │   ├── カテゴリフィルター（category_id）が機能すること ✓
        │   │   │   ├── キーワード検索（keyword）が機能すること ✓
        │   │   │   ├── ソート（sort=price_asc）が機能すること ✓
        │   │   │   └── ソート（sort=price_desc）が機能すること ✓
        │   │   └── GET /products/:id
        │   │       ├── 商品詳細をバリエーション・画像付きで返すこと ✓
        │   │       ├── 存在しない商品は404を返すこと ✓
        │   │       └── 非公開商品は404を返すこと ✓
        │   ├── dto/
        │   │   ├── create-product.dto.ts ✓
        │   │   ├── update-product.dto.ts ✓
        │   │   ├── add-variation.dto.ts ✓
        │   │   ├── update-variation.dto.ts ✓
        │   │   └── add-image.dto.ts ✓
        │   └── entities/
        │       ├── product.entity.spec.ts
        │       │   ├── テーブル名がproductsであること
        │       │   ├── nameカラムが存在すること
        │       │   ├── priceカラムがINT型で存在すること
        │       │   ├── stockカラムが存在しないこと（バリエーションで管理）
        │       │   ├── isPublishedプロパティのカラムが存在すること
        │       │   ├── deletedAtカラムが存在すること（論理削除）
        │       │   └── categoryへのリレーションが存在すること
        │       ├── product-image.entity.spec.ts
        │       │   ├── テーブル名がproduct_imagesであること
        │       │   ├── productIdカラムがINT型で存在すること
        │       │   ├── urlカラムが存在すること
        │       │   ├── sortOrderカラムがINT型で存在すること
        │       │   └── productsへのリレーション（productId FK）が存在すること
        │       └── product-variation.entity.spec.ts
        │           ├── テーブル名がproduct_variationsであること
        │           ├── stockカラムがINT型で存在すること
        │           ├── sizeカラムが存在すること
        │           ├── colorカラムが存在すること
        │           ├── priceカラムがINT型で存在すること
        │           └── deletedAtカラムが存在すること（論理削除）
        ├── carts/
        │   └── entities/
        │       └── cart.entity.spec.ts
        │           ├── テーブル名がcartsであること
        │           ├── sessionIdカラムが存在すること
        │           ├── variationIdカラムが存在すること
        │           ├── quantityカラムがINT型で存在すること
        │           ├── reservedAtカラムが存在すること
        │           ├── expiresAtカラムが存在すること
        │           └── product_variationsへのリレーションが存在すること
        ├── orders/
        │   └── entities/
        │       ├── order.entity.spec.ts
        │       │   ├── テーブル名がordersであること
        │       │   ├── statusカラムがenum型で存在すること
        │       │   ├── shippingAddressカラムがJSON型で存在すること
        │       │   ├── shippingFeeカラムがINT型で存在すること
        │       │   ├── totalAmountカラムがINT型で存在すること
        │       │   ├── stripeSessionIdカラムがnullableで存在すること
        │       │   └── usersへのリレーションが存在すること
        │       └── order-item.entity.spec.ts
        │           ├── テーブル名がorder_itemsであること
        │           ├── orderIdカラムがINT型で存在すること
        │           ├── variationIdカラムがINT型で存在すること
        │           ├── productIdカラムがINT型で存在すること
        │           ├── productNameカラムが存在すること（スナップショット）
        │           ├── sizeカラムが存在すること（スナップショット）
        │           ├── colorカラムが存在すること（スナップショット）
        │           ├── priceカラムがINT型で存在すること（スナップショット）
        │           ├── ordersへのリレーション（orderId FK）が存在すること
        │           └── product_variationsへのリレーション（variationId FK）が存在すること
        └── store-settings/
            ├── store-settings.service.spec.ts
            │   ├── getSettings
            │   │   ├── 店舗設定が存在するとき、その設定を返すこと ✓
            │   │   └── 店舗設定が存在しないとき、エラーを投げること ✓
            │   └── updateSettings
            │       ├── invoiceNumberを更新できること ✓
            │       ├── invoiceNumberをnullに更新できること ✓
            │       ├── shippingFixedFeeを更新できること ✓
            │       ├── shippingFreeThresholdを更新できること ✓
            │       ├── shippingFixedFeeが0以下の場合エラーを投げること ✓
            │       ├── shippingFixedFeeが負数の場合エラーを投げること ✓
            │       ├── shippingFreeThresholdが0以下の場合エラーを投げること ✓
            │       ├── shippingFreeThresholdが負数の場合エラーを投げること ✓
            │       ├── 複数フィールドを同時に更新できること ✓
            │       ├── 大きな数値（超大値）も受け入れること ✓
            │       └── 1円の設定も受け入れること（境界値） ✓
            ├── store-settings.controller.spec.ts
            │   ├── getSettings
            │   │   ├── 店舗設定を返すこと ✓
            │   │   └── invoiceNumberがnullの場合も返すこと ✓
            │   └── updateSettings
            │       ├── invoiceNumberを更新できること ✓
            │       ├── shippingFixedFeeを更新できること ✓
            │       ├── shippingFreeThresholdを更新できること ✓
            │       ├── バリデーション失敗時、サービスがエラーを投げること ✓
            │       └── 複数フィールドを同時に更新できること ✓
            ├── store-settings.e2e-spec.ts
            │   ├── GET /admin/store-settings
            │   │   ├── super管理者がアクセスできること ✓
            │   │   ├── 一般管理者がアクセスできること ✓
            │   │   ├── トークンなしでアクセスできないこと ✓
            │   │   └── 無効なトークンでアクセスできないこと ✓
            │   └── PUT /admin/store-settings
            │       ├── super管理者が更新できること ✓
            │       ├── 一般管理者は更新できないこと ✓
            │       ├── トークンなしでアクセスできないこと ✓
            │       ├── 無効なトークンでアクセスできないこと ✓
            │       ├── バリデーション失敗（配送料0円） ✓
            │       └── バリデーション失敗（無料閾値負数） ✓
            └── entities/
                └── store-settings.entity.spec.ts
                    ├── テーブル名がstore_settingsであること
                    ├── invoiceNumberカラムがnullableで存在すること
                    ├── shippingFixedFeeカラムがINT型で存在すること
                    └── shippingFreeThresholdカラムがINT型で存在すること
            └── carts/
                ├── carts.service.spec.ts
                │   ├── getCart
                │   │   ├── セッションIDに対応するカートアイテムを返すこと ✓
                │   │   └── カートが空の場合は空配列を返すこと ✓
                │   ├── addToCart
                │   │   ├── 在庫があるバリエーションをカートに追加できること ✓
                │   │   ├── 在庫をquantity分減算すること ✓
                │   │   ├── 同一セッション・同一バリエーション再追加時はquantityを加算すること ✓
                │   │   ├── 在庫不足時はConflictExceptionを投げること ✓
                │   │   └── 存在しないバリエーションはNotFoundExceptionを投げること ✓
                │   ├── updateItem
                │   │   ├── 数量を増加した場合に在庫を差分だけ減算すること ✓
                │   │   ├── 数量を減少した場合に在庫を差分だけ加算すること ✓
                │   │   ├── 増加後に在庫不足ならConflictExceptionを投げること ✓
                │   │   ├── 他セッションのカートアイテムはForbiddenExceptionを投げること ✓
                │   │   └── 存在しないカートアイテムはNotFoundExceptionを投げること ✓
                │   ├── removeItem
                │   │   ├── 削除時に在庫をquantityだけ加算すること ✓
                │   │   └── 他セッションのアイテムはForbiddenExceptionを投げること ✓
                │   └── releaseExpiredCarts
                │       ├── 期限切れカートの在庫を返却すること ✓
                │       ├── 期限切れカートのstatusをexpiredに更新すること ✓
                │       └── 期限切れでないカートは処理しないこと ✓
                └── carts.controller.spec.ts
                    ├── getCartがCartsServiceのgetCartメソッドを呼ぶこと ✓
                    ├── addToCartがCartsServiceのaddToCartメソッドを呼ぶこと ✓
                    ├── updateItemがCartsServiceのupdateItemメソッドを呼ぶこと ✓
                    └── removeItemがCartsServiceのremoveItemメソッドを呼ぶこと ✓
        ├── admin-orders/
        │   ├── admin-orders.service.spec.ts
        │   │   ├── findAll
        │   │   │   ├── ページネーション付きで注文一覧（ユーザー情報含む）を返すこと ✓
        │   │   │   ├── page=2,limit=10の時スキップ量が10になること ✓
        │   │   │   └── ステータスフィルターが指定された場合、そのステータスで絞り込むこと ✓
        │   │   ├── findById
        │   │   │   ├── 存在する注文IDの詳細（商品明細・配送先・ユーザー情報）を返すこと ✓
        │   │   │   └── 存在しない注文IDではNotFoundExceptionを投げること ✓
        │   │   ├── updateStatus
        │   │   │   ├── paid→shippedへの遷移が成功すること ✓
        │   │   │   ├── shipped→deliveredへの遷移が成功すること ✓
        │   │   │   ├── 不正遷移（delivered→shipped）はBadRequestExceptionを投げること ✓
        │   │   │   ├── 不正遷移（paid→delivered）はBadRequestExceptionを投げること ✓
        │   │   │   └── 存在しない注文IDではNotFoundExceptionを投げること ✓
        │   │   └── cancelOrder
        │   │       ├── paidの注文をcancelledにしStripe返金後refundedになること ✓
        │   │       ├── shippedの注文もStripe返金してrefundedになること ✓
        │   │       ├── pendingの注文はStripe返金なしでcancelledになること ✓
        │   │       ├── pendingでstripeSessionIdがあっても返金しないこと ✓
        │   │       ├── payment_statusがpaidでない場合はcancelledのまま返金しないこと ✓
        │   │       ├── Stripe返金APIが失敗した場合、InternalServerErrorExceptionを投げること ✓
        │   │       ├── sessions.retrieve が失敗した場合、InternalServerErrorExceptionを投げること ✓
        │   │       ├── deliveredの注文はキャンセル不可でBadRequestExceptionを投げること ✓
        │   │       └── 存在しない注文IDではNotFoundExceptionを投げること ✓
        │   └── admin-orders.controller.spec.ts
        │       ├── findAll
        │       │   ├── page/limit付きで注文一覧を返すこと ✓
        │       │   └── statusフィルターが指定された場合サービスへ渡すこと ✓
        │       ├── findById
        │       │   └── 注文詳細を返すこと ✓
        │       ├── updateStatus
        │       │   └── ステータス更新をサービスに委譲してvoidを返すこと ✓
        │       └── cancelOrder
        │           └── キャンセルをサービスに委譲してvoidを返すこと ✓
        ├── mail/
        │   └── mail.service.spec.ts
        │       └── sendOrderConfirmation
        │           ├── 注文したユーザーのメールアドレスに送信されること ✓
        │           ├── 件名に注文番号が含まれること ✓
        │           ├── order-confirmation テンプレートが使用されること ✓
        │           └── テンプレートに注文番号・商品一覧・配送料・合計・配送先が渡されること ✓
        ├── payments/
        │   ├── payments.service.spec.ts
        │   │   ├── createCheckoutSession
        │   │   │   ├── カートが空の場合はBadRequestExceptionを投げること ✓
        │   │   │   ├── カート合計が閾値未満の場合は固定配送料を加算すること ✓
        │   │   │   ├── カート合計が閾値以上の場合は配送料が無料になること ✓
        │   │   │   ├── Stripe Checkout SessionのURLを返すこと ✓
        │   │   │   ├── pendingステータスで注文レコードを作成すること ✓
        │   │   │   └── 購入時点の価格スナップショットをorder_itemsに保存すること ✓
        │   │   └── handleWebhook
        │   │       ├── 無効なStripe署名の場合はBadRequestExceptionを投げること ✓
        │   │       ├── checkout.session.completed以外のイベントは無視して200を返すこと ✓
        │   │       ├── 処理済みのevent_idは二重処理しないこと ✓
        │   │       ├── checkout.session.completed受信後に注文ステータスをpaidにすること ✓
        │   │       ├── checkout.session.completed受信後にカートをpurchasedに更新すること ✓
        │   │       ├── 処理後にstripe_eventsにevent_idをINSERTすること ✓
        │   │       ├── checkout.session.completed受信後にメール送信が呼ばれること ✓
        │   │       ├── メール送信が失敗してもWebhookが正常完了すること ✓
        │   │       ├── 無効署名の時はメール送信が呼ばれないこと ✓
        │   │       └── checkout.session.completed以外のイベントはメール送信されないこと ✓
        │   ├── payments.controller.spec.ts
        │   │   ├── createCheckoutSession
        │   │   │   ├── checkout URLを返すこと ✓
        │   │   │   └── カートが空の場合はBadRequestExceptionが伝播すること ✓
        │   │   └── handleWebhook
        │   │       ├── Stripe-Signatureヘッダーをサービスに渡すこと ✓
        │   │       └── 署名検証失敗時はBadRequestExceptionが伝播すること ✓
        │   └── payments.e2e-spec.ts
        │       ├── POST /payments/checkout
        │       │   ├── JWTなしで401を返すこと ✓
        │       │   ├── カートが空のユーザーがリクエストすると400を返すこと ✓
        │       │   └── カートに商品があるユーザーがリクエストするとStripe checkout URLを返すこと ✓
        │       └── POST /payments/webhook
        │           ├── 無効なStripe署名の場合400を返すこと ✓
        │           ├── checkout.session.completed以外のイベントは無視して200を返すこと ✓
        │           ├── checkout.session.completedで注文ステータスがpaidに更新されること ✓
        │           ├── checkout.session.completedでカートがpurchasedに更新されること ✓
        │           └── 同一イベントIDを2回受信しても二重処理しないこと（冪等性） ✓
└── frontend/
    └── src/
        ├── lib/
        │   └── auth.test.ts
        │       ├── setToken
        │       │   └── トークンをlocalStorageに保存すること
        │       ├── getToken
        │       │   ├── 保存済みトークンを返すこと
        │       │   └── トークンが未保存の時はnullを返すこと
        │       ├── removeToken
        │       │   └── localStorageからトークンを削除すること
        │       ├── isAuthenticated
        │           ├── トークンが存在する時はtrueを返すこと
        │           └── トークンが存在しない時はfalseを返すこと
        │       └── isAdminAuthenticated
        │           ├── typeがadminのJWTの時、trueを返すこと
        │           ├── typeがuserのJWTの時、falseを返すこと
        │           └── JWT形式でないトークンの時、falseを返すこと
        ├── routes/
        │   ├── -_admin.test.tsx
        │   │   ├── 管理者トークンがない時、/admin/loginへリダイレクトすること
        │   │   └── 管理者トークンがある時、リダイレクトしないこと
        │   ├── -_admin.admin.categories.test.tsx
        │   │   ├── カテゴリ一覧が表示されること ✓
        │   │   └── エラー時にエラーメッセージが表示されること ✓
        │   ├── -_admin.admin.admins.test.tsx
        │   │   ├── 取得成功時、管理者一覧を表示すること
        │   │   └── 取得失敗時、エラーメッセージを表示すること
        ├── -_admin.admin.settings.test.tsx
        │   ├── 設定取得成功時、現在の設定値をフォームに表示すること
        │   ├── 設定取得失敗時、エラーメッセージを表示すること
        │   ├── super管理者がフォームを送信すると、設定が更新されること
        │   ├── PUT失敗時、エラーメッセージを表示すること
        │   ├── 配送料に0を入力すると、バリデーションエラーを表示すること
        │   ├── JWTトークンのデコードに失敗した場合、エラーメッセージを表示すること ✓
        │   └── 更新APIのレスポンス形式が不正な場合、エラーメッセージを表示すること ✓
        ├── -_admin.admin.members.test.tsx ✓
        │   ├── 会員一覧が表示されること ✓
        │   ├── 詳細表示と削除操作が動作すること ✓
        │   ├── 会員一覧の取得に失敗したとき、エラーメッセージが表示されること ✓
        │   ├── 会員詳細の取得に失敗したとき、エラーメッセージが表示されること ✓
        │   └── 会員削除に失敗したとき、エラーメッセージが表示されること ✓
        ├── -_admin.admin.orders.test.tsx
        │   ├── 注文一覧が表示されること ✓
        │   ├── 詳細ボタンで注文詳細が表示されること ✓
        │   ├── ステータス更新ボタンで発送済みに変更でき、詳細が再取得されること ✓
        │   ├── キャンセル・返金ボタンで注文をキャンセルでき、詳細が再取得されること ✓
        │   ├── 注文一覧の取得に失敗したとき、エラーメッセージが表示されること ✓
        │   ├── 注文詳細の取得に失敗したとき、エラーメッセージが表示されること ✓
        │   ├── 詳細取得に失敗したとき、前回の詳細が残らないこと ✓
        │   ├── ステータス更新に失敗したとき、エラーメッセージが表示されること ✓
        │   ├── キャンセルに失敗したとき、エラーメッセージが表示されること ✓
        │   └── pending状態の注文でもキャンセルボタンが表示されること ✓
        ├── -admin.login.test.tsx
        │   ├── 表示時、管理者ログインフォームが表示されること
        │   ├── 有効な認証情報の時、トークンを保存して/adminへ遷移すること
        │   ├── 認証に失敗した時、エラーメッセージを表示すること
        │   └── レスポンス形式が不正な時、エラーメッセージを表示すること
        ├── -_authenticated.cart.test.tsx
        │   ├── カートアイテムが一覧表示されること ✓
        │   ├── 空カート時にメッセージが表示されること ✓
        │   ├── 削除ボタンクリックでremoveItemが呼ばれること ✓
        │   └── チェックアウトボタンが表示され、クリックで遷移できること ✓
        ├── -_authenticated.checkout.test.tsx
        │   ├── 配送先フォームが表示されること ✓
        │   ├── フォーム送信でcheckout APIが呼ばれStripeにリダイレクトすること ✓
        │   ├── 必須フィールドが空の場合はバリデーションエラーが表示されること ✓
        │   ├── API エラー時にエラートーストが表示されること ✓
        │   └── 送信中はボタンが「処理中...」になること ✓
        ├── -_authenticated.checkout.complete.test.tsx
        │   ├── 注文完了メッセージが表示されること ✓
        │   ├── 確認メール送信の案内が表示されること ✓
        │   └── トップページへのリンクが表示されること ✓
        └── components/
            └── layouts/
                ├── MemberLayout.test.tsx ✓
                │   ├── 未認証の場合
                │   │   ├── ロゴが表示されること ✓
                │   │   ├── 商品一覧リンクが表示されること ✓
                │   │   ├── カートリンクが表示されること ✓
                │   │   ├── ログインリンクが表示されること ✓
                │   │   ├── マイページリンクが表示されないこと ✓
                │   │   ├── フッターにコピーライトが表示されること ✓
                │   │   └── childrenが描画されること ✓
                │   └── 認証済みの場合
                │       ├── マイページリンクが表示されること ✓
                │       ├── マイページリンクのhrefが /my-page であること ✓
                │       └── ログインリンクが表示されないこと ✓
                ├── pages/
                │   └── MyPage.test.tsx ✓
                │       ├── プロフィールが表示されること ✓
                │       ├── メールアドレス入力欄が disabled であること ✓
                │       ├── 注文履歴が表示されること ✓
                │       ├── 注文がない場合「まだ注文はありません」が表示されること ✓
                │       ├── プロフィール保存成功時に成功メッセージが表示されること ✓
                │       ├── プロフィール保存失敗時にエラーメッセージが表示されること ✓
                │       ├── 退会ボタンを押すと確認ダイアログが表示されること ✓
                │       ├── 退会成功時にトークンを削除してログインページへリダイレクトすること ✓
                │       ├── 退会失敗時にエラーメッセージがダイアログ内に表示されること ✓
                │       └── 読み込み中は「読み込み中...」が表示されること ✓
                ├── -_admin.admin.products.test.tsx
                │   ├── 商品一覧が表示されること ✓
                │   ├── 公開状態がラベルで表示されること ✓
                │   ├── API取得失敗時にエラーメッセージが表示されること ✓
                │   ├── 「商品登録」ボタンをクリックするとフォームが表示されること ✓
                │   ├── 商品登録フォームを送信すると登録APIが呼ばれること ✓
                │   ├── 商品登録失敗時にエラーメッセージが表示されること ✓
                │   ├── 「編集」ボタンをクリックすると編集フォームが表示されること ✓
                │   ├── 編集フォームを送信すると更新APIが呼ばれること ✓
                │   ├── 「削除」ボタンをクリックして確認するとAPIが呼ばれること ✓
                │   ├── 削除確認でキャンセルするとAPIが呼ばれないこと ✓
                │   ├── 「公開する」ボタンをクリックすると公開APIが呼ばれること ✓
                │   ├── 「非公開にする」ボタンをクリックすると非公開APIが呼ばれること ✓
                │   ├── 「バリエーション」ボタンをクリックするとバリエーション一覧が表示されること ✓
                │   ├── バリエーション追加フォームを送信するとAPIが呼ばれること ✓
                │   ├── バリエーション削除ボタンをクリックするとAPIが呼ばれること ✓
                │   ├── 商品登録フォームにカテゴリ選択肢が表示されること ✓
                │   ├── 商品登録フォームでカテゴリを選択して登録するとAPIにcategoryIdが渡されること ✓
                │   ├── 商品編集フォームにカテゴリ選択肢が表示されること ✓
                │   ├── 商品登録フォームに公開状態チェックボックスが表示されること ✓
                │   ├── 公開チェックをオンにして登録するとAPIにisPublished:trueが渡されること ✓
                │   ├── 画像管理ボタンをクリックすると画像セクションが表示されること ✓
                │   ├── 画像URLを入力して追加するとAPIが呼ばれること ✓
                │   ├── 画像削除ボタンをクリックするとAPIが呼ばれること ✓
                │   ├── 「バリエーション」ボタンを2回クリックするとバリエーション一覧が非表示になること ✓
                │   ├── 「画像」ボタンを2回クリックすると画像セクションが非表示になること ✓
                │   ├── 画像がない商品の画像セクションを開くと「画像がありません」と表示されること ✓
                │   ├── 画像追加に失敗した場合エラーメッセージが表示されること ✓
                │   └── 画像削除に失敗した場合エラーメッセージが表示されること ✓
                ├── -_authenticated.products.index.test.tsx
                │   ├── 商品名・価格・カテゴリが表示されること ✓
                │   ├── API取得失敗時にエラーメッセージが表示されること ✓
                │   ├── ローディング中は読み込み中テキストが表示されること ✓
                │   ├── キーワード入力時に検索パラメータ付きでAPIが呼ばれること ✓
                │   ├── カテゴリセレクトが表示されること ✓
                │   ├── カテゴリ選択時にcategory_idパラメータ付きでAPIが呼ばれること ✓
                │   ├── ソートセレクトが表示されること ✓
                │   ├── ソート変更時にsortパラメータ付きでAPIが呼ばれること ✓
                │   ├── 商品名をクリックすると詳細ページへのリンクになっていること ✓
                │   └── APIが不正な形式のデータを返した場合にエラーメッセージが表示されること ✓
                └── -_authenticated.products.$productId.test.tsx
                    ├── 商品名・価格・説明が表示されること ✓
                    ├── 商品画像が表示されること ✓
                    ├── API取得失敗時にエラーメッセージが表示されること ✓
                    ├── バリエーション一覧が選択肢として表示されること ✓
                    ├── 在庫0のバリエーションは無効化されていること ✓
                    ├── 数量入力フィールドが表示されること ✓
                    ├── バリエーションを選択してカートに追加するとAPIが呼ばれること ✓
                    ├── バリエーション未選択でカートに追加しようとするとエラーになること ✓
                    └── カート追加失敗時にエラーメッセージが表示されること ✓
                ├── AdminLayout.test.tsx
                │   ├── サイドバーに「ダッシュボード」リンクが表示されること
                │   ├── サイドバーに「商品管理」リンクが表示されること
                │   ├── サイドバーに「注文管理」リンクが表示されること
                │   ├── サイドバーに「会員管理」リンクが表示されること
                │   ├── サイドバーに「管理者アカウント管理」リンクが表示されること
                │   ├── サイドバーに「店舗設定」リンクが表示されること
                │   ├── childrenが描画されること
                │   ├── モバイルメニュートグルボタンが存在すること
                │   └── モバイルメニュートグルを押すとサイドバーが開閉すること
                ├── -_authenticated.products.test.tsx\n                │   ├── 商品一覧が表示されること ✓\n                │   ├── 商品価格が表示されること ✓\n                │   ├── カテゴリ名が表示されること ✓\n                │   ├── API取得失敗時にエラーメッセージが表示されること ✓\n                │   ├── 検索フォームを送信するとAPIが呼ばれること ✓\n                │   ├── 並び替え変更するとAPIが呼ばれること ✓\n                │   └── 商品が0件の時「見つかりませんでした」が表示されること ✓\n                ├── -_authenticated.products.$productId.test.tsx\n                │   ├── 商品名・説明・価格が表示されること ✓\n                │   ├── カテゴリ名が表示されること ✓\n                │   ├── 論理削除済みバリエーションは表示されないこと ✓\n                │   ├── 在庫0のバリエーションは無効で表示されること ✓\n                │   ├── バリエーションを選択するとaria-pressedがtrueになること ✓\n                │   ├── バリエーション未選択時はカートに追加ボタンが無効なこと ✓\n                │   ├── バリエーションを選択してカートに追加するとAPIが呼ばれること ✓\n                │   ├── カート追加失敗時にエラートーストが表示されること ✓\n                │   ├── API取得失敗時にエラーメッセージが表示されること ✓\n                │   ├── 数量を増減できること ✓\n                │   └── 商品一覧へのパンくずが表示されること ✓\n                └── RootLayout.test.tsx
                    ├── childrenが描画されること
                    └── toast()を呼ぶとトースト通知が表示されること
    └── tests/
        ├── admin-login.spec.ts
        │   └── Navigate to admin login page and login as admin, verify dashboard displays with correct title ✓
        └── purchase.spec.ts
            └── 商品購入からカード決済完了まで
                ├── ユーザー登録（API） ✓
                ├── ログインしてトークン取得（API） ✓
                ├── カートに商品追加（API） ✓
                ├── カートページでアイテム確認（ブラウザ） ✓
                ├── チェックアウトページへ移動（ブラウザ） ✓
                ├── 配送先フォーム入力（ブラウザ） ✓
                ├── Stripe Checkout へリダイレクト（ブラウザ） ✓
                ├── Stripe 決済フォーム入力（ブラウザ） ✓
                └── 決済完了ページ確認（ブラウザ） ✓
```
