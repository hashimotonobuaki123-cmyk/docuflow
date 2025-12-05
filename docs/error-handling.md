# ⚠️ Error Handling - エラーハンドリング方針

DocuFlow のエラーハンドリング設計とベストプラクティスです。

## 📋 目次

- [エラーハンドリング戦略](#エラーハンドリング戦略)
- [エラーの分類](#エラーの分類)
- [クライアントサイド](#クライアントサイド)
- [サーバーサイド](#サーバーサイド)
- [ユーザーへのフィードバック](#ユーザーへのフィードバック)
- [ログ収集](#ログ収集)

---

## エラーハンドリング戦略

### 基本方針

1. **Fail Gracefully** - エラーが発生してもアプリ全体がクラッシュしない
2. **User-Friendly Messages** - 技術的なエラーを分かりやすいメッセージに変換
3. **Recoverable Actions** - 可能な限りリカバリ手段を提供
4. **Comprehensive Logging** - デバッグに必要な情報を記録

```
┌─────────────────────────────────────────────────────────────┐
│                      Error Boundary                         │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                    App Components                      │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │  │
│  │  │   Page A    │  │   Page B    │  │   Page C    │   │  │
│  │  │ try/catch   │  │ try/catch   │  │ try/catch   │   │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘   │  │
│  └───────────────────────────────────────────────────────┘  │
│                           │                                  │
│                           ▼                                  │
│              Toast Notification / Error Page                │
└─────────────────────────────────────────────────────────────┘
```

---

## エラーの分類

### 1. ユーザーエラー（4xx 系）

| エラー | 原因 | 対応 |
|:-------|:-----|:-----|
| 認証エラー | 未ログイン、セッション切れ | ログインページへリダイレクト |
| バリデーションエラー | 不正な入力値 | フォームにエラー表示 |
| 権限エラー | アクセス権限なし | エラーメッセージ表示 |
| Not Found | リソースが存在しない | 404 ページ表示 |

### 2. システムエラー（5xx 系）

| エラー | 原因 | 対応 |
|:-------|:-----|:-----|
| サーバーエラー | 予期しない例外 | 汎用エラーページ表示 |
| DB接続エラー | Supabase 接続失敗 | リトライ後エラー表示 |
| API エラー | OpenAI API 失敗 | フォールバック処理 |
| タイムアウト | 処理時間超過 | タイムアウトメッセージ |

### 3. ネットワークエラー

| エラー | 原因 | 対応 |
|:-------|:-----|:-----|
| オフライン | ネットワーク切断 | オフライン通知表示 |
| CORS エラー | クロスオリジン問題 | 設定修正必要 |
| Rate Limit | API 制限到達 | 待機メッセージ表示 |

---

## クライアントサイド

### Error Boundary

```tsx
// app/error.tsx
"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // エラーログを送信
    console.error("Unhandled error:", error);
  }, [error]);

  return (
    <div className="error-container">
      <h2>エラーが発生しました</h2>
      <p>申し訳ございません。問題が発生しました。</p>
      <button onClick={() => reset()}>もう一度試す</button>
    </div>
  );
}
```

### API リクエストのエラーハンドリング

```typescript
// 推奨パターン
async function fetchWithErrorHandling<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      if (response.status === 401) {
        // 認証エラー → ログインページへ
        window.location.href = "/auth/login";
        throw new Error("認証が必要です");
      }

      if (response.status === 404) {
        throw new Error("リソースが見つかりません");
      }

      if (response.status >= 500) {
        throw new Error("サーバーエラーが発生しました");
      }

      throw new Error(`HTTP Error: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    if (error instanceof TypeError) {
      // ネットワークエラー
      throw new Error("ネットワーク接続を確認してください");
    }
    throw error;
  }
}
```

### フォームバリデーション

```typescript
// バリデーションエラーの表示
function validateForm(data: FormData): ValidationResult {
  const errors: Record<string, string> = {};

  if (!data.email) {
    errors.email = "メールアドレスを入力してください";
  } else if (!isValidEmail(data.email)) {
    errors.email = "有効なメールアドレスを入力してください";
  }

  if (!data.password) {
    errors.password = "パスワードを入力してください";
  } else if (data.password.length < 6) {
    errors.password = "パスワードは6文字以上で入力してください";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
```

---

## サーバーサイド

### API Route のエラーハンドリング

```typescript
// app/api/documents/route.ts
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // バリデーション
    if (!body.title) {
      return NextResponse.json(
        { error: "タイトルは必須です" },
        { status: 400 }
      );
    }

    // DB操作
    const { data, error } = await supabase
      .from("documents")
      .insert(body)
      .select()
      .single();

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { error: "データの保存に失敗しました" },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "予期しないエラーが発生しました" },
      { status: 500 }
    );
  }
}
```

### Supabase エラーハンドリング

```typescript
// Supabase エラーコードの対応
function handleSupabaseError(error: PostgrestError): string {
  switch (error.code) {
    case "23505": // unique_violation
      return "このデータは既に登録されています";
    case "23503": // foreign_key_violation
      return "関連するデータが見つかりません";
    case "42501": // insufficient_privilege
      return "この操作を実行する権限がありません";
    case "PGRST301": // JWT expired
      return "セッションが切れました。再度ログインしてください";
    default:
      return "データベースエラーが発生しました";
  }
}
```

### OpenAI API エラーハンドリング

```typescript
// OpenAI エラーの対応
async function generateSummaryWithFallback(text: string): Promise<string> {
  try {
    return await generateSummary(text);
  } catch (error) {
    if (error instanceof OpenAI.APIError) {
      if (error.status === 429) {
        // Rate limit - リトライ
        await sleep(1000);
        return await generateSummary(text);
      }
      if (error.status === 401) {
        console.error("Invalid API key");
        return "AI要約は現在利用できません";
      }
    }

    // フォールバック: 先頭200文字を返す
    return text.substring(0, 200) + "...";
  }
}
```

---

## ユーザーへのフィードバック

### Toast 通知

```typescript
// 成功
addToast({
  type: "success",
  title: "保存しました",
  message: "ドキュメントが正常に保存されました",
});

// エラー
addToast({
  type: "error",
  title: "保存に失敗しました",
  message: "もう一度お試しください",
});

// 警告
addToast({
  type: "warning",
  title: "注意",
  message: "ファイルサイズが大きいため、処理に時間がかかる場合があります",
});
```

### エラーメッセージのガイドライン

| ❌ 悪い例 | ✅ 良い例 |
|:---------|:---------|
| Error: ECONNREFUSED | サーバーに接続できません。しばらくしてからお試しください。 |
| 500 Internal Server Error | エラーが発生しました。問題が続く場合はサポートにお問い合わせください。 |
| Invalid input | メールアドレスの形式が正しくありません。 |
| null pointer exception | 予期しないエラーが発生しました。ページを再読み込みしてください。 |

---

## ログ収集

### クライアントサイドログ

```typescript
// エラーログの構造
interface ErrorLog {
  timestamp: string;
  type: "error" | "warning" | "info";
  message: string;
  stack?: string;
  url: string;
  userAgent: string;
  userId?: string;
}

function logError(error: Error, context?: Record<string, unknown>) {
  const log: ErrorLog = {
    timestamp: new Date().toISOString(),
    type: "error",
    message: error.message,
    stack: error.stack,
    url: window.location.href,
    userAgent: navigator.userAgent,
    ...context,
  };

  // 本番環境ではログサービスに送信
  if (process.env.NODE_ENV === "production") {
    // sendToLogService(log);
  }

  console.error(log);
}
```

### サーバーサイドログ

```typescript
// 構造化ログ
function log(level: "info" | "warn" | "error", message: string, meta?: object) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...meta,
  };

  console.log(JSON.stringify(logEntry));
}

// 使用例
log("error", "Document creation failed", {
  userId: "user-123",
  documentId: "doc-456",
  error: error.message,
});
```

---

## チェックリスト

### 新機能実装時

- [ ] 入力バリデーションを実装
- [ ] API エラーのハンドリングを実装
- [ ] ユーザーフレンドリーなエラーメッセージを設定
- [ ] エラーログを適切に出力
- [ ] Error Boundary でキャッチされることを確認

### コードレビュー時

- [ ] try-catch が適切に配置されているか
- [ ] エラーが握りつぶされていないか
- [ ] ユーザーにフィードバックが返されるか
- [ ] センシティブな情報がエラーメッセージに含まれていないか

