## 💳 Billing & Plans - 課金・プラン設計

DocuFlow を世界展開する SaaS として運用するための、  
包括的な課金・プラン設計と Stripe 連携の実装ドキュメントです。

---

## 1. プラン設計

### 1.1 プラン一覧

| Plan | 対象 | 主な制限 | 価格 (USD) |
|:-----|:-----|:---------|:----------|
| `free` | 個人 / お試し | ドキュメント 50件 / ストレージ 100MB / AI呼び出し 100回/月 / メンバー 1人 | $0 |
| `pro` | 小規模チーム / 個人 | ドキュメント 1,000件 / ストレージ 5GB / AI呼び出し 5,000回/月 / メンバー 10人 | $9.99/月 |
| `team` | 中規模チーム | ドキュメント 10,000件 / ストレージ 50GB / AI呼び出し 50,000回/月 / メンバー 50人 | $49.99/月 |
| `enterprise` | 大規模組織 | 無制限 / カスタムブランディング / API アクセス / 優先サポート | カスタム価格 |

### 1.2 プラン機能比較

| 機能 | Free | Pro | Team | Enterprise |
|:-----|:----:|:---:|:----:|:----------:|
| ドキュメント数上限 | 50 | 1,000 | 10,000 | 無制限 |
| ストレージ容量 | 100MB | 5GB | 50GB | 無制限 |
| 月間AI呼び出し | 100 | 5,000 | 50,000 | 無制限 |
| メンバー数上限 | 1 | 10 | 50 | 無制限 |
| ベクトル検索 | ✓ | ✓ | ✓ | ✓ |
| 共有リンク | ✓ | ✓ | ✓ | ✓ |
| コメント機能 | ✓ | ✓ | ✓ | ✓ |
| バージョン履歴 | - | ✓ | ✓ | ✓ |
| 優先サポート | - | ✓ | ✓ | ✓ |
| カスタムブランディング | - | - | ✓ | ✓ |
| API アクセス | - | - | ✓ | ✓ |

### 1.3 データモデル

#### 個人ユーザープラン (`user_settings` テーブル)

- `subscription_plan text not null default 'free' check (subscription_plan in ('free', 'pro', 'team', 'enterprise'))`
- `stripe_customer_id text` - Stripe の Customer ID
- `stripe_subscription_id text` - Stripe の Subscription ID
- `billing_email text` - 請求先メールアドレス
- `subscription_status text check (subscription_status in ('active', 'canceled', 'past_due', 'trialing') or subscription_status is null)`
- `current_period_end timestamptz` - 現在の請求期間の終了日時

#### 組織プラン (`organizations` テーブル)

- `plan text not null default 'free' check (plan in ('free', 'pro', 'team', 'enterprise'))`
- `seat_limit integer` - メンバー数上限
- `document_limit integer` - ドキュメント数上限
- `stripe_customer_id text` - Stripe の Customer ID
- `stripe_subscription_id text` - Stripe の Subscription ID
- `billing_email text` - 請求先メールアドレス
- `subscription_status text check (subscription_status in ('active', 'canceled', 'past_due', 'trialing') or subscription_status is null)`
- `current_period_end timestamptz` - 現在の請求期間の終了日時

### 1.4 プラン制限の適用

- **ドキュメント作成時**: `canCreateDocument()` で制限チェック
- **メンバー追加時**: `canAddMember()` で制限チェック
- **有効プランの決定**: 組織が指定されている場合は組織プラン、それ以外は個人プラン

---

## 2. Stripe 連携設計（MVP）

### 2.1 使用コンポーネント

- **Stripe Checkout**: 新規サブスクリプションの作成
- **Stripe Customer Portal**: 既存サブスクリプションの管理（プラン変更、キャンセル、支払い方法更新）
- **Stripe Webhook**: サブスクリプション状態の同期

### 2.2 環境変数

```env
# Stripe API Keys
STRIPE_SECRET_KEY=sk_test_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Stripe Price IDs (月額サブスクリプション)
STRIPE_PRICE_PRO_MONTH=price_xxx
STRIPE_PRICE_TEAM_MONTH=price_xxx
STRIPE_PRICE_ENTERPRISE_MONTH=price_xxx
```

### 2.3 フロー概要

#### 新規サブスクリプション

```text
Settings (Billing) 画面
    │
    │ 「プランを選択」→「アップグレード」ボタン
    ▼
POST /api/billing/create-checkout-session
    │
    │ { plan: "pro", type: "personal" | "organization" }
    │
    ├─ Stripe Checkout Session 作成
    │   ├─ metadata に plan, type, user_id/organization_id を設定
    │   └─ subscription_data.metadata にも同じ情報を設定（Webhook側の確実な同定）
    └─ URL を返す
    │
    ▼
ブラウザが Stripe Checkout へリダイレクト
    │
    │ 支払い成功
    ▼
Stripe Webhook → /api/stripe/webhook
    │
    ├─ checkout.session.completed イベント
    └─ user_settings または organizations の plan を更新
          + stripe_customer_id / stripe_subscription_id / billing_email を保存
```

#### サブスクリプション管理

```text
Settings (Billing) 画面
    │
    │ 「請求ポータルを開く」ボタン
    ▼
POST /api/billing/create-portal-session
    │
    ├─ Stripe Customer Portal セッション作成
    └─ URL を返す
    │
    ▼
ブラウザが Stripe Customer Portal へリダイレクト
    │
    │ ユーザーがプラン変更 / キャンセル / 支払い方法更新
    ▼
Stripe Webhook → /api/stripe/webhook
    │
    ├─ customer.subscription.updated イベント
    │   └─ プラン変更を反映
    └─ customer.subscription.deleted イベント
        └─ プランを 'free' にダウングレード
```

### 2.4 セキュリティと制限

- Stripe Webhook は `STRIPE_WEBHOOK_SECRET` で署名検証
- Webhook から直接ユーザーを特定するのではなく、`metadata` に `user_id` または `organization_id` を持たせて紐付け
- Webhook は冪等である必要があるため、`stripe_webhook_events` テーブルで `event.id` を一意保存して重複処理を防止
- 個人プランと組織プランは独立して管理
- 月額固定プランのみ対応（従量課金は将来の拡張で対応）

---

## 3. アプリ側の制御ポイント

### 3.1 プラン制限の実装

#### ドキュメント作成時

```typescript
import { canCreateDocument } from "@/lib/subscription";

const limitCheck = await canCreateDocument(userId, organizationId);
if (!limitCheck.allowed) {
  throw new Error(limitCheck.reason);
}
```

#### メンバー追加時（組織プランのみ）

```typescript
import { canAddMember } from "@/lib/subscription";

const limitCheck = await canAddMember(organizationId);
if (!limitCheck.allowed) {
  throw new Error(limitCheck.reason);
}
```

### 3.2 有効プランの取得

```typescript
import { getEffectivePlan } from "@/lib/subscription";

const { plan, limits, type } = await getEffectivePlan(userId, organizationId);
// 組織が指定されている場合は組織プラン、それ以外は個人プラン
```

### 3.3 UI 表示

- `/settings/billing` にて:
  - 現在のプラン（個人 or 組織）
  - プラン選択UI（Free / Pro / Team / Enterprise）
  - 使用状況メーター（ドキュメント数、メンバー数、ストレージ使用量）
  - Stripe Customer Portal へのリンク（既存サブスクリプションがある場合）

---

## 4. 実装ファイル

### 4.1 コア実装

- `lib/subscription.ts`: プラン定義、制限チェック、プラン情報取得
- `lib/subscriptionUsage.ts`: 使用量追跡（ストレージ、AI呼び出し回数）

### 4.2 API エンドポイント

- `app/api/billing/create-checkout-session/route.ts`: Checkout セッション作成（試用期間・クーポン対応）
- `app/api/billing/create-portal-session/route.ts`: Customer Portal セッション作成
- `app/api/billing/subscription/route.ts`: サブスクリプション管理（取得、更新、キャンセル、再開）
- `app/api/billing/payment-methods/route.ts`: 支払い方法の管理（追加、削除、一覧取得）
- `app/api/billing/invoices/route.ts`: 請求履歴の取得とPDFダウンロード
- `app/api/billing/setup-intent/route.ts`: Setup Intent作成（Stripe Elements用）
- `app/api/billing/coupons/route.ts`: クーポンコード検証
- `app/api/stripe/webhook/route.ts`: Webhook ハンドラー（全イベント対応）

### 4.3 UI コンポーネント

- `app/settings/billing/page.tsx`: 課金設定ページ
- `app/settings/billing/SubscriptionPlans.tsx`: プラン選択UIコンポーネント
- `app/settings/billing/PaymentMethodsSection.tsx`: 支払い方法管理セクション
- `app/settings/billing/InvoicesSection.tsx`: 請求履歴セクション
- `components/StripeCardElement.tsx`: Stripe Elements カード入力UI
- `components/StripeProvider.tsx`: Stripe Elements プロバイダー
- `components/SubscriptionLimitWarning.tsx`: プラン制限警告コンポーネント

---

## 5. 実装済み機能

### 5.1 サブスクリプション管理

- ✅ プラン選択とアップグレード（Stripe Checkout）
- ✅ プラン変更（即座に反映、比例計算）
- ✅ サブスクリプションキャンセル
- ✅ キャンセルされたサブスクリプションの再開
- ✅ 試用期間（Trial）の設定
- ✅ クーポン・プロモーションコード対応

### 5.2 支払い方法管理

- ✅ Stripe Elements による安全なカード入力
- ✅ 支払い方法の追加・削除
- ✅ デフォルト支払い方法の設定
- ✅ 支払い方法一覧の表示

### 5.3 請求管理

- ✅ 請求履歴の表示
- ✅ 請求書PDFのダウンロード
- ✅ Stripe Customer Portal へのアクセス

### 5.4 Webhook処理

- ✅ `checkout.session.completed`: 新規サブスクリプション
- ✅ `customer.subscription.updated`: プラン変更
- ✅ `customer.subscription.deleted`: キャンセル
- ✅ `invoice.payment_succeeded`: 支払い成功
- ✅ `invoice.payment_failed`: 支払い失敗
- ✅ `customer.subscription.trial_will_end`: 試用期間終了予告

## 6. 将来の拡張アイデア

- 年額プラン（月額の10%割引など）
- 学割プラン（学生向け50%割引）
- 従量課金（AI呼び出し回数に応じた追加課金）
- プラン変更時の使用量超過の警告
- 税務情報の管理（VAT番号など）
- 請求書の自動送信設定
- レシートの管理


