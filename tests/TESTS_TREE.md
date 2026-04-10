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
        │   │   └── POST /auth/login
        │   │       ├── 正しい認証情報の時、accessTokenを返すこと
        │   │       ├── 未登録メールアドレスの時、401を返すこと
        │   │       ├── パスワードが不一致の時、401を返すこと
        │   │       └── メールアドレス形式が不正な時、400を返すこと
        │   ├── auth.service.spec.ts
        │   │   ├── register
        │   │   │   ├── 有効なメールアドレスとパスワードの時、id/emailを返すこと
        │   │   │   └── パスワードをレスポンスに含まない
        │   │   └── login
        │   │       ├── 正しい認証情報でアクセストークンを返す
        │   │       ├── 存在しないメールアドレスはUnauthorizedExceptionを投げる
        │   │       ├── パスワード不一致はUnauthorizedExceptionを投げる
        │   │       └── メールアドレス/パスワード不一致のエラーメッセージは同一（列挙攻撃対策）
        │   ├── auth.controller.spec.ts
        │   │   ├── register
        │   │   │   └── 有効な入力の時、ユーザー登録結果を返すこと
        │   │   └── login
        │   │       ├── 有効な認証情報の時、アクセストークンを返すこと
        │   │       └── サービスがエラーを投げた時、エラーが伝播すること
        │   ├── dto/
        │   │   └── auth.dto.spec.ts
        │   │       ├── RegisterDto
        │   │       │   ├── 有効なメールアドレスとパスワードの時、エラーがないこと
        │   │       │   ├── メールアドレス形式が不正な時、emailがエラーになること
        │   │       │   └── パスワードが8文字未満の時、passwordがエラーになること
        │   │       └── LoginDto
        │   │           ├── 有効なメールアドレスとパスワードの時、エラーがないこと
        │   │           ├── メールアドレス形式が不正な時、emailがエラーになること
        │   │           └── パスワードが空文字の時、passwordがエラーになること
        │   └── jwt.strategy.spec.ts
        │       └── validate
        │           └── 有効なJWTペイロードの時、subをidにマッピングしてid/emailを返すこと
        ├── users/
        │   └── users.service.spec.ts
        │       ├── create
        │       │   ├── 新規ユーザーを作成してパスワードをハッシュ化する
        │       │   ├── 既存メールアドレスはConflictExceptionを投げる
        │       │   └── ConflictException時はsaveを呼ばない
        │       └── findByEmail
        │           ├── 存在するメールアドレスのユーザーを返す
        │           └── 存在しないメールアドレスはnullを返す
        └── todos/
            ├── todos.controller.spec.ts
            │   ├── findAll
            │   │   └── service.findAll() の結果を返す
            │   ├── findOne
            │   │   └── service.findOne(id) の結果を返す
            │   ├── create
            │   │   └── service.create(dto) の結果を返す
            │   ├── update
            │   │   └── service.update(id, dto) の結果を返す
            │   └── remove
            │       └── service.remove(id) を呼び出す
            ├── todos.service.spec.ts
            │   ├── findAll
            │   │   ├── 全Todoの配列を返す
            │   │   └── Todoが0件のとき空配列を返す
            │   ├── findOne
            │   │   ├── 指定IDのTodoを返す
            │   │   └── 存在しないIDはNotFoundExceptionを投げる
            │   ├── create
            │   │   ├── 新しいTodoを作成して保存する
            │   │   └── descriptionなしでもTodoを作成できる
            │   ├── update
            │   │   ├── 既存Todoを更新して返す
            │   │   └── 存在しないIDの更新はNotFoundExceptionを投げる
            │   └── remove
            │       ├── 指定IDのTodoを削除する
            │       └── 存在しないIDの削除はNotFoundExceptionを投げる
            └── dto/
                └── todo.dto.spec.ts
                    ├── CreateTodoDto
                    │   ├── title
                    │   │   ├── 有効なtitleはエラーなし
                    │   │   ├── titleが空文字はエラー (IsNotEmpty)
                    │   │   ├── titleなしはエラー (IsNotEmpty)
                    │   │   └── 数値はエラー (IsString)
                    │   ├── description（省略可能）
                    │   │   ├── descriptionなしはエラーなし
                    │   │   ├── 有効なdescriptionはエラーなし
                    │   │   └── descriptionが数値はエラー (IsString)
                    │   └── priority（省略可能 / Min1 Max3）
                    │       ├── priorityなしはエラーなし
                    │       ├── priority=1,2,3 はエラーなし
                    │       ├── priority=0 はエラー (Min(1))
                    │       ├── priority=4 はエラー (Max(3))
                    │       └── priority が文字列はエラー (IsNumber)
                    └── UpdateTodoDto
                        ├── すべて省略はエラーなし（全フィールドOptional）
                        ├── title
                        │   ├── 有効なtitleはエラーなし
                        │   └── titleが数値はエラー (IsString)
                        ├── completed
                        │   ├── completed=true はエラーなし
                        │   ├── completed=false はエラーなし
                        │   └── completed が文字列はエラー (IsBoolean)
                        └── priority（Min1 Max3）
                            ├── priority=1,2,3 はエラーなし
                            ├── priority=0 はエラー (Min(1))
                            └── priority=4 はエラー (Max(3))
```
