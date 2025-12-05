## 💳 Billing & Plans - 課金・プラン設計

DocuFlow を「個人利用のツール」ではなく「チーム向け SaaS」として運用するための、  
課金・プラン設計と Stripe 連携の方針をまとめたドキュメントです。

---

## 1. プラン設計

### 1.1 プラン一覧（想定）

| Plan | 対象 | 主な制限 | 想定価格 (例) |
|:-----|:-----|:---------|:-------------|
| `free` | 個人 / お試し | 1人組織 / ドキュメント数 50件まで | ¥0 |
| `pro` | 小規模チーム (〜10人) | メンバー数 10 / ドキュメント数 1,000件 | ¥3,000/月 |
| `team` | 10〜50人規模 | メンバー数 50 / ドキュメント数 10,000件 | ¥9,800/月 |

### 1.2 データモデル

- `organizations` テーブルに以下のカラムを追加:
  - `plan text not null default 'free' check (plan in ('free', 'pro', 'team'))`
  - `seat_limit integer` - メンバー数上限
  - `document_limit integer` - ドキュメント数上限
  - `stripe_customer_id text` - Stripe の Customer ID
  - `stripe_subscription_id text` - Stripe の Subscription ID
  - `billing_email text` - 請求先メールアドレス（Stripe 側の値を同期）

将来的には、Seat ベース課金 / Usage ベース課金（AI 呼び出し回数など）への拡張も想定。

---

## 2. Stripe 連携設計（MVP）

### 2.1 使用コンポーネント

- Stripe Checkout
- Stripe Webhook
- 環境変数:

```env
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_PRICE_PRO_MONTH=price_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

### 2.2 フロー概要

```text
Settings (Billing) 画面
    │
    │ 「Pro にアップグレード」ボタン
    ▼
POST /api/billing/create-checkout-session
    │
    ├─ Stripe Checkout Session 作成
    └─ URL を返す
    │
    ▼
ブラウザが Stripe Checkout へリダイレクト
    │
    │ 支払い成功
    ▼
Stripe Webhook → /api/stripe/webhook
    │
    └─ 該当 organization の plan を 'pro' に更新
          + stripe_customer_id / stripe_subscription_id / billing_email を保存
```

### 2.3 セキュリティと制限

- Stripe Webhook は `STRIPE_WEBHOOK_SECRET` で署名検証。
- Webhook から直接ユーザーを特定するのではなく、`metadata` に `organization_id` を持たせて紐付け。
- 現状は **月額固定プランのみ** を想定（従量課金は将来の拡張で対応）。

---

## 3. アプリ側の制御ポイント

### 3.1 組織ごとの制限ロジック

- メンバー追加時:
  - `organization_members` の件数が `seat_limit` 以上ならエラー。
- ドキュメント作成時:
  - `documents` の件数が `document_limit` 以上ならエラー。

これらは現時点では **「UI メッセージと設計レベル」** での実装としておき、  
将来的に DB 制約や Supabase Functions で強制することも検討する。

### 3.2 UI 表示

- `/settings/billing` にて:
  - 現在のプラン (`free` / `pro` / `team`)
  - メンバー数 / 席数上限
  - ドキュメント数 / 上限
  - 「Pro にアップグレード」「Team プランについて問い合わせ」などの CTA を表示。

---

## 4. 将来の拡張アイデア

- プランごとの AI 呼び出し回数上限（OpenAI API コスト最適化）
- 過去請求履歴画面（Stripe Billing Portal 連携）
- 年額プラン / 学割プラン


