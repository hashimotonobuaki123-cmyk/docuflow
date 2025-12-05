# 📊 Monitoring - 監視・ログ設計

DocuFlow の監視設計とログ収集に関するドキュメントです。

## 📋 目次

- [監視アーキテクチャ](#監視アーキテクチャ)
- [メトリクス](#メトリクス)
- [アラート設計](#アラート設計)
- [ログ設計](#ログ設計)
- [ダッシュボード](#ダッシュボード)

---

## 監視アーキテクチャ

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Monitoring Stack                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐            │
│   │   Vercel    │    │  Supabase   │    │   OpenAI    │            │
│   │  Analytics  │    │  Dashboard  │    │   Usage     │            │
│   └──────┬──────┘    └──────┬──────┘    └──────┬──────┘            │
│          │                  │                  │                    │
│          └──────────────────┼──────────────────┘                    │
│                             │                                        │
│                             ▼                                        │
│                    ┌─────────────────┐                              │
│                    │   Monitoring    │                              │
│                    │   Dashboard     │                              │
│                    └─────────────────┘                              │
│                             │                                        │
│              ┌──────────────┼──────────────┐                        │
│              │              │              │                        │
│              ▼              ▼              ▼                        │
│         ┌────────┐    ┌────────┐    ┌────────┐                     │
│         │ Slack  │    │ Email  │    │ GitHub │                     │
│         │ Alert  │    │ Alert  │    │ Issues │                     │
│         └────────┘    └────────┘    └────────┘                     │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## メトリクス

### 1. アプリケーションメトリクス

| メトリクス | 説明 | 目標値 |
|:-----------|:-----|:-------|
| Page Load Time | ページ読み込み時間 | < 3秒 |
| Time to First Byte (TTFB) | 最初のバイトまでの時間 | < 800ms |
| First Contentful Paint (FCP) | 最初のコンテンツ描画 | < 1.8秒 |
| Largest Contentful Paint (LCP) | 最大コンテンツ描画 | < 2.5秒 |
| Cumulative Layout Shift (CLS) | レイアウトシフト | < 0.1 |
| First Input Delay (FID) | 最初の入力遅延 | < 100ms |

### 2. ビジネスメトリクス

| メトリクス | 説明 | 計測方法 |
|:-----------|:-----|:---------|
| DAU/MAU | アクティブユーザー数 | Supabase Auth |
| ドキュメント作成数 | 新規ドキュメント/日 | DB クエリ |
| AI 要約利用率 | AI 機能の利用率 | activity_logs |
| 共有リンク発行数 | シェア機能の利用 | DB クエリ |
| エラー率 | エラー発生率 | ログ集計 |

### 3. インフラメトリクス

| メトリクス | 説明 | 閾値 |
|:-----------|:-----|:-----|
| CPU 使用率 | Vercel Function CPU | < 80% |
| メモリ使用率 | Vercel Function Memory | < 80% |
| DB 接続数 | Supabase Connections | < 80% of limit |
| API レイテンシ | API 応答時間 | < 500ms |
| OpenAI API 使用量 | トークン消費量 | Budget 内 |

---

## アラート設計

### 重要度レベル

| レベル | 説明 | 対応時間 | 通知先 |
|:-------|:-----|:---------|:-------|
| 🔴 Critical | サービス停止 | 即時対応 | Slack + SMS |
| 🟠 High | 機能障害 | 1時間以内 | Slack + Email |
| 🟡 Medium | パフォーマンス低下 | 24時間以内 | Slack |
| 🟢 Low | 注意が必要 | 1週間以内 | Email |

### アラートルール

#### Critical

```yaml
- name: Service Down
  condition: "http_status != 200 for 5 minutes"
  action: "page_oncall"

- name: Database Connection Failed
  condition: "db_connection_errors > 10 in 1 minute"
  action: "page_oncall"

- name: Authentication Service Down
  condition: "auth_errors > 50% in 5 minutes"
  action: "page_oncall"
```

#### High

```yaml
- name: High Error Rate
  condition: "error_rate > 5% in 15 minutes"
  action: "notify_team"

- name: Slow Response Time
  condition: "p95_latency > 3000ms for 10 minutes"
  action: "notify_team"

- name: OpenAI API Quota Warning
  condition: "api_usage > 80% of daily_quota"
  action: "notify_team"
```

#### Medium

```yaml
- name: Increased Error Rate
  condition: "error_rate > 1% in 1 hour"
  action: "create_ticket"

- name: Memory Usage High
  condition: "memory_usage > 70% for 30 minutes"
  action: "create_ticket"
```

---

## ログ設計

### ログレベル

| レベル | 用途 | 例 |
|:-------|:-----|:---|
| ERROR | 予期しないエラー | 例外、システム障害 |
| WARN | 警告が必要な状態 | リトライ発生、閾値超過 |
| INFO | 重要な操作ログ | ユーザーアクション、API呼び出し |
| DEBUG | デバッグ情報 | 詳細なトレース情報 |

### 構造化ログフォーマット

```json
{
  "timestamp": "2024-01-15T12:34:56.789Z",
  "level": "INFO",
  "service": "docuflow",
  "environment": "production",
  "traceId": "abc123",
  "userId": "user-456",
  "action": "create_document",
  "message": "Document created successfully",
  "metadata": {
    "documentId": "doc-789",
    "fileType": "pdf",
    "fileSize": 1024000,
    "processingTime": 1234
  }
}
```

### ログの分類

#### アクセスログ

```json
{
  "type": "access",
  "method": "GET",
  "path": "/api/documents",
  "status": 200,
  "duration": 45,
  "userAgent": "Mozilla/5.0...",
  "ip": "xxx.xxx.xxx.xxx"
}
```

#### アプリケーションログ

```json
{
  "type": "application",
  "action": "ai_summary_generated",
  "documentId": "doc-123",
  "inputLength": 5000,
  "outputLength": 200,
  "tokensUsed": 150,
  "duration": 2500
}
```

#### エラーログ

```json
{
  "type": "error",
  "error": "OpenAI API Error",
  "message": "Rate limit exceeded",
  "stack": "Error: Rate limit...",
  "context": {
    "endpoint": "/v1/chat/completions",
    "retryCount": 3
  }
}
```

---

## ダッシュボード

### 概要ダッシュボード

```
┌─────────────────────────────────────────────────────────────┐
│                    DocuFlow Dashboard                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │   Health     │  │   Users      │  │  Documents   │       │
│  │   ● Online   │  │   1,234      │  │   5,678      │       │
│  │   99.9%      │  │   +12% ↑     │  │   +8% ↑      │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              Response Time (p95)                     │    │
│  │   ████████████████████████░░░░  245ms               │    │
│  │   Target: 500ms                                      │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              Error Rate (24h)                        │    │
│  │   ░░░░░░░░░░░░░░░░░░░░░░░░░░░  0.1%                 │    │
│  │   Target: < 1%                                       │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              AI Usage (Today)                        │    │
│  │   ████████████░░░░░░░░░░░░░░░░  45% of quota        │    │
│  │   12,345 tokens used                                 │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Vercel Analytics

Vercel では以下のメトリクスを自動収集：

- **Web Vitals**: LCP, FID, CLS, TTFB
- **Page Views**: ページビュー数
- **Visitors**: ユニークビジター数
- **Top Pages**: 人気ページ
- **Referrers**: 参照元

### Supabase Dashboard

Supabase では以下を監視：

- **Database**: クエリ数、接続数、ストレージ使用量
- **Auth**: ログイン数、新規登録数、セッション数
- **Storage**: ファイル数、使用量
- **Realtime**: 接続数、メッセージ数

---

## 運用チェックリスト

### 日次

- [ ] エラーアラートの確認
- [ ] ダッシュボードの確認
- [ ] 異常なトラフィックの有無

### 週次

- [ ] パフォーマンストレンドの分析
- [ ] エラーログのレビュー
- [ ] リソース使用量の確認

### 月次

- [ ] SLA/SLO の達成状況確認
- [ ] キャパシティプランニング
- [ ] コスト分析
- [ ] 改善施策の検討

---

## ツール

| 用途 | ツール | 備考 |
|:-----|:-------|:-----|
| APM | Vercel Analytics | 無料枠で十分 |
| エラートラッキング | Sentry | リアルタイムエラー監視 |
| ログ | Vercel Logs | リアルタイムログ |
| DB監視 | Supabase Dashboard | 標準搭載 |
| アラート | GitHub Actions + Sentry | CI/CDと統合 |
| 外形監視 | UptimeRobot | 無料で使用可能 |

---

## 🔔 Sentry によるエラートラッキング

### Sentry ダッシュボード概要

```
┌─────────────────────────────────────────────────────────────────────┐
│                     Sentry Dashboard - DocuFlow                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │   Issues     │  │   Events     │  │   Users      │              │
│  │   12         │  │   1,234      │  │   Affected   │              │
│  │   Unresolved │  │   This week  │  │   45         │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │              Error Frequency (7 days)                        │   │
│  │   ▂▃▅▂▁▁▂▃▂▁▁▁▂▃▅▇▅▃▂▁▁▂▃▂▁                               │   │
│  │   Peak: 2024-12-01 15:00 - AI API Rate Limit                │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │              Top Issues                                      │   │
│  │   1. OpenAI Rate Limit Exceeded     │ 45 events │ High      │   │
│  │   2. Supabase Connection Timeout    │ 12 events │ Medium    │   │
│  │   3. PDF Parse Error               │ 8 events  │ Low       │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Sentry アラート設定

#### アラートルール

```yaml
# Critical - 即時対応
- name: "High Error Rate"
  conditions:
    - "Number of events > 100 in 5 minutes"
  action: "Slack #alerts + PagerDuty"

- name: "New Unhandled Exception"
  conditions:
    - "First seen error in production"
  action: "Slack #errors"

# Warning - 24時間以内対応
- name: "AI API Errors Spike"
  conditions:
    - "OpenAI errors > 10 in 30 minutes"
  action: "Slack #alerts"

- name: "Auth Errors Spike"
  conditions:
    - "Auth errors > 20 in 1 hour"
  action: "Slack #alerts"
```

### Sentry 統合コード例

#### エラーキャプチャ

```typescript
import { captureError, captureAiError } from "@/lib/sentry";

// 基本的なエラーキャプチャ
try {
  await riskyOperation();
} catch (error) {
  captureError(error, {
    tags: { feature: "document_upload" },
    extra: { fileSize: file.size },
    level: "error",
  });
}

// AI 操作のエラー
try {
  await generateSummary(content);
} catch (error) {
  captureAiError("generate_summary", error, {
    model: "gpt-4.1-mini",
    inputLength: content.length,
  });
}
```

#### パフォーマンストレース

```typescript
import * as Sentry from "@sentry/nextjs";

// カスタムスパン
const span = Sentry.startInactiveSpan({
  name: "PDF Processing",
  op: "file.process",
});

try {
  const result = await processPdf(file);
  span?.setStatus({ code: 1 }); // OK
} catch (error) {
  span?.setStatus({ code: 2, message: "Error" });
  throw error;
} finally {
  span?.end();
}
```

### 環境変数設定

```env
# Sentry DSN（必須）
NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx

# ソースマップアップロード用（Vercel ビルド時）
SENTRY_ORG=your-organization
SENTRY_PROJECT=docuflow
SENTRY_AUTH_TOKEN=sntrys_xxx...

# リリースバージョン（Vercel が自動設定）
NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA=abc123...
```

### Vercel 環境変数の設定手順

1. [Sentry](https://sentry.io) でプロジェクトを作成
2. DSN を取得（Settings > Client Keys）
3. Auth Token を取得（Settings > Auth Tokens）
4. Vercel Dashboard で環境変数を設定：
   - `NEXT_PUBLIC_SENTRY_DSN`
   - `SENTRY_ORG`
   - `SENTRY_PROJECT`
   - `SENTRY_AUTH_TOKEN`

### フィルタリングルール

以下のエラーは自動的にフィルタリングされ、Sentry に送信されません：

```typescript
const ignoredErrors = [
  "ResizeObserver loop limit exceeded",  // ブラウザの無害な警告
  "Network request failed",               // 一時的なネットワーク障害
  "Load failed",                          // リソース読み込み失敗
  "cancelled",                            // ユーザーによるキャンセル
];
```

### プライバシー保護

- セッションリプレイでは全テキストがマスクされます
- メディア（画像・動画）はブロックされます
- 認証ヘッダーとCookieは自動的にスクラブされます
- メールアドレスは一部マスクして送信されます

