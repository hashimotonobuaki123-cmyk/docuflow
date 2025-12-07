<div align="center">

<br />

# 📄 DocuFlow

### AI-Powered Document Workspace

**PDF・Word を一瞬で要約。スマートなドキュメント管理を。**

<br />

[![CI](https://img.shields.io/github/actions/workflow/status/AyumuKobayashiproducts/docuflow/ci.yml?branch=main&style=for-the-badge&logo=github&label=CI)](https://github.com/AyumuKobayashiproducts/docuflow/actions)
[![Lighthouse](https://img.shields.io/github/actions/workflow/status/AyumuKobayashiproducts/docuflow/lighthouse.yml?branch=main&style=for-the-badge&logo=lighthouse&logoColor=white&label=Lighthouse)](https://github.com/AyumuKobayashiproducts/docuflow/actions/workflows/lighthouse.yml)
[![Playwright](https://img.shields.io/badge/Playwright-E2E_Tests-45ba4b?style=for-the-badge&logo=playwright&logoColor=white)](https://playwright.dev/)
[![codecov](https://img.shields.io/codecov/c/github/AyumuKobayashiproducts/docuflow?style=for-the-badge&logo=codecov&logoColor=white)](https://codecov.io/gh/AyumuKobayashiproducts/docuflow)
[![License](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js_16-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React_19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)

<br />

<a href="https://docuflow-azure.vercel.app" target="_blank">
  <img src="https://img.shields.io/badge/🌐_Live_Demo-Visit_App-10b981?style=for-the-badge" alt="Live Demo" />
</a>

<br />
<br />

[**📖 Docs**](docs/) &nbsp;&nbsp;·&nbsp;&nbsp; [**🐛 Bug Report**](https://github.com/AyumuKobayashiproducts/docuflow/issues) &nbsp;&nbsp;·&nbsp;&nbsp; [**✨ Feature Request**](https://github.com/AyumuKobayashiproducts/docuflow/issues)

<br />

---

### 🌍 English Summary

> **DocuFlow** is an AI-powered document workspace that cuts search time from minutes to seconds.  
> Upload a PDF or Word file, and AI auto-generates summaries, tags, and embeddings for semantic search.  
> Production-ready SaaS architecture with RBAC, Billing, Analytics, OpenAPI, and full CI/CD — built on Next.js 16, Supabase, and OpenAI.

#### このプロジェクトで伝えたい 3 つのポイント

- **AI × ベクトル検索で「探す時間」を 10 分 → 数十秒レベルまで短縮できる設計**
- **Organizations / RBAC / Billing / Analytics まで含めた「本番運用を想定した SaaS アーキテクチャ」**
- **Web Vitals / Lighthouse CI / E2E / OpenAPI / SDK / Docs までそろえた「品質と開発体験」**

---

<br />

<img src="docs/screenshots/dashboard.png" alt="DocuFlow Dashboard" width="90%" style="border-radius: 12px; box-shadow: 0 20px 40px rgba(0,0,0,0.1);" />

<br />
<br />

</div>

<br />

## 💡 About

**DocuFlow** は、「ドキュメントを探す時間」をゼロに近づける AI ドキュメントワークスペースです。

PDF や Word をドロップするだけで、AI が **要約 → タグ付け → ベクトル埋め込み** まで自動実行。  
あとは検索バーに聞くだけ——キーワードでも自然言語でも、欲しい情報に数秒でたどり着けます。

<br />

<div align="center">

| 🎯 よくある課題 | ✨ DocuFlow の解決策 |
|:---|:---|
| ドキュメントが増えると探せない | AI タグ付け + ベクトル検索で **検索時間 1/10 以下** |
| 要約を書く時間がない | GPT-4 が **3〜5 行で自動要約** |
| PDF・Word の中身が検索できない | テキスト抽出 → 全文 + セマンティック検索 |
| 共有が面倒 | **ワンクリックで公開リンク発行**、いつでも停止可 |

</div>

<br />

## 🎮 Try the Demo

<div align="center">

**👉 [https://docuflow-azure.vercel.app](https://docuflow-azure.vercel.app)**

</div>

デモ環境には **15件以上のサンプルドキュメント** （仕様書・議事録・企画書・レポート・マニュアル）が登録されています。以下の流れで、DocuFlow の AI 機能をぜひ体験してください！

### 🔎 Quick Links for Reviewers / 面接官向けショートカット

- `/app` – メインダッシュボード（AI 要約・インサイト・通知ベル）
- `/settings/organizations` – 組織 / RBAC（Owner / Admin / Member）
- `/app/whats-new` & `docs/case-study-startup.md` – 開発の継続性とユースケース

### 📋 おすすめの試し方

| Step | やること | 見どころ |
|:----:|:---------|:---------|
| 1️⃣ | `/auth/login` でログイン | モダンな認証UI、パスワード強度チェック |
| 2️⃣ | `/app` ダッシュボードを確認 | ドキュメント数・最近のアクティビティ・AI類似検索結果 |
| 3️⃣ | 検索バーに **「認証」** と入力 | API設計仕様書・オンボーディングマニュアルなどがヒット |
| 4️⃣ | 検索バーに **「売上」** と入力 | 月次レポート・キャンペーン企画書がヒット |
| 5️⃣ | ドキュメントをクリックして詳細表示 | AI要約・自動タグ・バージョン履歴 |
| 6️⃣ | 「共有リンク発行」ボタンを押す | ワンクリックで公開リンク生成 |

### 🔍 AI ベクトル検索のデモ

登録されているドキュメント例と、検索キーワードの対応：

```
「認証」「セキュリティ」 → API設計仕様書、オンボーディングマニュアル
「売上」「マーケティング」 → 月次売上レポート、キャンペーン企画書
「設計」「データベース」   → DB設計書、システムリプレイス提案書
「会議」「進捗」          → 週次定例MTG議事録、キックオフ議事録
```

> 💡 **Tip**: キーワードだけでなく、「ユーザー登録の流れを知りたい」のような **自然言語の質問** でも検索できます！

<br />

## ✨ Features

<table>
<tr>
<td width="33%" valign="top">

### 🤖 AI Auto-Summary

GPT-4.1-mini による高精度な自動要約。日本語に最適化されたプロンプトで、文書の要点を 3〜5 行に凝縮。

</td>
<td width="33%" valign="top">

### 🏷️ Smart Tagging

文書内容を解析し、最適なタグを最大 3 つ自動生成。後から探しやすいドキュメント管理を実現。

</td>
<td width="33%" valign="top">

### 📄 File Support

PDF・Word ファイルをドラッグ＆ドロップ。`pdf-parse` / `mammoth` でテキスト抽出し、即座に AI 処理。

</td>
</tr>
<tr>
<td width="33%" valign="top">

### 🔍 Full-Text Search

タイトル・要約・本文・タグを横断検索。カテゴリフィルタ、お気に入り、ピン留めで素早くアクセス。

</td>
<td width="33%" valign="top">

### 🔐 Authentication

メールアドレス & パスワードに加えて、Google OAuth ログインをサポート。Supabase Auth で安全にトークン管理。

</td>
<td width="33%" valign="top">

### 🔗 One-Click Share

共有リンクをワンクリックで発行。認証不要で閲覧可能な公開ビュー。いつでも停止可能。

</td>
</tr>
<tr>
<td width="33%" valign="top">

### 🌙 Dark Mode

ライト / ダーク / システム設定の 3 モード対応。目に優しいテーマ切り替え。

</td>
<td width="33%" valign="top">

### 🔔 Toast Notifications

操作結果をリアルタイム通知。成功・エラー・警告を美しいトーストで表示。

</td>
<td width="33%" valign="top">

### 📝 Version History

編集履歴を自動保存。過去バージョンをいつでも確認でき、変更の追跡が容易に。

</td>
</tr>
</table>

<br />

<div align="center">

### ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|:--------:|:-------|
| `⌘K` | コマンドパレットを開く |
| `?` | ショートカットヘルプを表示 |
| `G` `D` | ダッシュボードへ移動 |
| `G` `N` | 新規作成ページへ移動 |
| `/` | 検索にフォーカス |

</div>

<br />

## 🛠️ Tech Stack

<div align="center">

### Frontend

[![Next.js](https://img.shields.io/badge/Next.js_16-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React_19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

### Backend & Infrastructure

[![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![OpenAI](https://img.shields.io/badge/OpenAI-412991?style=for-the-badge&logo=openai&logoColor=white)](https://openai.com/)
[![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)

### Testing & Quality

[![Vitest](https://img.shields.io/badge/Vitest-6E9F18?style=for-the-badge&logo=vitest&logoColor=white)](https://vitest.dev/)
[![Playwright](https://img.shields.io/badge/Playwright-45ba4b?style=for-the-badge&logo=playwright&logoColor=white)](https://playwright.dev/)
[![ESLint](https://img.shields.io/badge/ESLint-4B32C3?style=for-the-badge&logo=eslint&logoColor=white)](https://eslint.org/)
[![Prettier](https://img.shields.io/badge/Prettier-F7B93E?style=for-the-badge&logo=prettier&logoColor=black)](https://prettier.io/)

</div>

<br />

## 🎯 Quality Gates

本プロジェクトでは以下の品質ゲートを設定し、継続的に監視しています。

| Metric | Target | Tool |
|:-------|:-------|:-----|
| **Lighthouse Performance** | 80+ | Lighthouse CI |
| **Lighthouse Accessibility** | 80+ | Lighthouse CI |
| **Lighthouse Best Practices** | 80+ | Lighthouse CI |
| **Lighthouse SEO** | 80+ | Lighthouse CI |
| **Unit Test Coverage** | 60%+ | Vitest + Codecov |
| **E2E Test Pass Rate** | 100% | Playwright |
| **TypeScript Strict Mode** | ✅ Enabled | tsc |
| **ESLint Errors** | 0 | ESLint |
| **SLO: /app p95 レイテンシ** | < 500ms（目標） | Vercel Analytics / ブラウザ計測 |
| **Supabase Migrations CI** | ✅ Always Green | GitHub Actions |

### CI/CD Pipeline

```
Push → Lint → Type Check → Unit Test → Build → E2E Test → Lighthouse → Deploy
```

<br />

## ⚖️ Non-Goals / Limitations

あえて「まだ対応していないこと」や「スコープ外としていること」も明示します。

- **大規模マルチテナント（何万組織）** は現時点ではスコープ外  
  - Supabase 単一プロジェクト + RLS を前提とした、中小規模チーム向けの設計です。
- **リアルタイム共同編集**（Google Docs 的な同時編集）は未対応  
  - コメント機能と通知（Notifications）でカバーし、シンプルさと実装コストのバランスを優先しています。
- **AI モデル / プロンプトの UI からの切り替え** は未提供  
  - 現状は `.env` とコードで管理し、「まずは安定したデモ体験」を優先しています。

これらは「やっていない」だけでなく、「なぜ今はやらないか」を含めて設計判断しています。

<br />

## 🔐 Authentication & Security Overview

DocuFlow は **Supabase Auth + RLS(PostgreSQL Row Level Security)** を前提に設計された、  
チーム利用向けのドキュメントワークスペースです。

- **認証 (Authentication)**  
  - メールアドレス & パスワード / Google OAuth をサポート  
  - Supabase Auth によるセッション管理 + `middleware.ts` でのルート保護  
- **認可 (Authorization)**  
  - `organizations` / `organization_members` による RBAC（owner / admin / member）  
  - `documents`, `activity_logs`, `notifications` など、主要テーブルで RLS を有効化  
- **共有と公開範囲**  
  - UUID ベースの共有リンク (`share_token`) による閲覧専用ビュー  
  - 共有リンクはいつでも無効化可能で、編集は常に認証済みユーザーのみ  
- **監査ログ / 監視**  
  - 重要な操作は `activity_logs` に記録  
  - Web Vitals / Lighthouse CI / Playwright による品質ゲート

詳しくは `docs/security.md` および `docs/operations.md` を参照してください。

<br />

## 📸 Screenshots

<div align="center">

### 🏠 メイン画面

<table>
<tr>
<td align="center" width="50%">

**Dashboard**
<br />
ドキュメント一覧・検索・フィルタリング

<img src="docs/screenshots/dashboard.png" alt="Dashboard" width="100%" />

</td>
<td align="center" width="50%">

**New Document**
<br />
AI要約付き新規作成・ファイルアップロード

<img src="docs/screenshots/new-document.png" alt="New Document" width="100%" />

</td>
</tr>
</table>

### 📄 ドキュメント管理

<table>
<tr>
<td align="center" width="50%">

**Document Detail**
<br />
詳細表示・AI要約・タグ・バージョン履歴

<img src="docs/screenshots/document-detail.png" alt="Document Detail" width="100%" />

</td>
<td align="center" width="50%">

**Share View**
<br />
認証不要の公開共有ページ

<img src="docs/screenshots/share-view.png" alt="Share View" width="100%" />

</td>
</tr>
</table>

### 🔐 認証 & 設定

<table>
<tr>
<td align="center" width="33%">

**Login**
<br />
メール認証

<img src="docs/screenshots/login.png" alt="Login" width="100%" />

</td>
<td align="center" width="33%">

**Signup**
<br />
新規アカウント作成

<img src="docs/screenshots/signup.png" alt="Signup" width="100%" />

</td>
<td align="center" width="33%">

**Settings**
<br />
ユーザー設定

<img src="docs/screenshots/settings.png" alt="Settings" width="100%" />

</td>
</tr>
</table>

</div>

<br />

## 🚀 Getting Started
 
## 🔍 How to Review (for Reviewers / 面接官向けの見方)

DocuFlow の「SaaSとしての完成度」を素早く確認したい人向けのチェックリストです。

1. **/auth/login → /app**  
   - 初回アクセス時のオンボーディングカードと、AI要約付きダッシュボードをざっと確認。
2. **/settings/organizations / /settings/billing**  
   - 組織（Organization）とプラン（Free / Pro）がどうモデリングされているかを見る。
3. **/dev/api-console + docs/openapi.yaml**  
   - `X-API-Key` を使った外部APIと、OpenAPI / SDK の設計を確認。
4. **/app/analytics**  
   - 日次 / 週次のドキュメント作成数から、チーム利用のKPI設計をざっくり把握。
5. **docs/**  
   - 特に `architecture.md`, `operations.md`, `security.md`, `case-study-startup.md` を読むことで、設計〜運用までのストーリーを追えるようになっています。

> 📚 **Case Study**  
> 実際の 10 人規模スタートアップ導入を想定したストーリーは  
> `docs/case-study-startup.md` にまとめています。


### Prerequisites

```
Node.js >= 22.x
npm >= 10.x
Supabase Account
OpenAI API Key
```

### Installation

```bash
# Clone the repository
git clone https://github.com/tanasho/dooai.git
cd dooai

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# Start development server
npm run dev
```

### Environment Variables

`.env.example` を `.env.local` にコピーしてから、必要な値を埋める想定です。

```bash
cp .env.example .env.local
```

代表的な環境変数:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# OpenAI
OPENAI_API_KEY=your-openai-api-key

# Optional: Account deletion
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

より詳しいセットアップ手順は `docs/dev-setup.md` を参照してください。

<br />

## 👤 Role & Responsibility

このリポジトリは、**個人開発プロジェクト** として以下の範囲を一貫して担当しています。

- **プロダクト企画 / UX 設計**: 「AI 要約 × ベクトル検索 × チーム利用」を前提にした画面構成・導線設計
- **アーキテクチャ / インフラ設計**: Next.js 16 App Router、Supabase(PostgreSQL + RLS)、Stripe、OpenAI などの選定と統合
- **アプリケーション実装**: 認証・組織/RBAC・通知・アナリティクス・Billing・API・SDK・PWA まで
- **品質保証 / 運用設計**: E2E テスト、Lighthouse CI、Web Vitals、Supabase Migrations CI、Security / Operations ドキュメント

チーム開発を想定しつつも、1 人で「プロダクトとしてどこまで作り込めるか」を示すことをゴールにしています。

<br />

## 📁 Project Structure

```
dooai/
├── 📂 app/                     # Next.js App Router
│   ├── 📂 app/                # Dashboard & workspace
│   ├── 📂 auth/               # Authentication pages
│   │   ├── login/
│   │   ├── signup/
│   │   ├── forgot/
│   │   └── reset/
│   ├── 📂 documents/          # Document CRUD
│   ├── 📂 new/                # Create new document
│   └── 📂 share/              # Public share view
│
├── 📂 components/             # Reusable UI components
├── 📂 lib/                    # Core utilities
│   ├── ai.ts                 # OpenAI integration
│   ├── filterDocuments.ts    # Search & filter logic
│   └── supabase*.ts          # Database clients
│
├── 📂 tests/                  # Test suites
├── 📂 docs/                   # Documentation
└── 📂 types/                  # TypeScript definitions
```

<br />

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                              Client                                   │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐     │
│  │   /app     │  │   /new     │  │ /documents │  │   /share   │     │
│  │ Dashboard  │  │  Upload    │  │   Detail   │  │   Public   │     │
│  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘     │
└────────┼───────────────┼───────────────┼───────────────┼─────────────┘
         │               │               │               │
         └───────────────┴───────┬───────┴───────────────┘
                                 │
                                 ▼
┌──────────────────────────────────────────────────────────────────────┐
│                       Next.js 16 App Router                          │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                    Server Components                         │    │
│  │  • Data fetching with Supabase                              │    │
│  │  • AI processing with OpenAI                                │    │
│  │  • File parsing (PDF/Word)                                  │    │
│  └─────────────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                       Middleware                             │    │
│  │  • Authentication guard                                      │    │
│  │  • Route protection                                         │    │
│  └─────────────────────────────────────────────────────────────┘    │
└──────────────────────────────────┬───────────────────────────────────┘
                                   │
                   ┌───────────────┴───────────────┐
                   │                               │
                   ▼                               ▼
┌──────────────────────────────┐   ┌──────────────────────────────┐
│          Supabase            │   │           OpenAI             │
│  ┌────────────────────────┐  │   │  ┌────────────────────────┐  │
│  │    Authentication      │  │   │  │     GPT-4.1-mini       │  │
│  │    • Email/Password    │  │   │  │  • Summary generation  │  │
│  │    • Session mgmt      │  │   │  │  • Tag extraction      │  │
│  └────────────────────────┘  │   │  │  • Title generation    │  │
│  ┌────────────────────────┐  │   │  └────────────────────────┘  │
│  │      PostgreSQL        │  │   └──────────────────────────────┘
│  │  • documents           │  │
│  │  • document_versions   │  │
│  │  • activity_logs       │  │
│  │  • RLS policies        │  │
│  └────────────────────────┘  │
└──────────────────────────────┘
```

<br />

## 💻 Development

```bash
# Run development server
npm run dev

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Lint code
npm run lint

# Format code
npm run format

# Type check
npm run type-check

# Run all validations
npm run validate

# Build for production
npm run build
```

<br />

## 📖 Documentation

| Document | Description |
|:---------|:------------|
| [📋 Specification](docs/spec-docuflow.md) | 機能仕様の詳細 |
| [🎨 UI Flow](docs/ui-flow.md) | 画面遷移とユーザーフロー |
| [🗄️ Database Schema](docs/db-schema.md) | テーブル定義と RLS |
| [🏗️ Architecture](docs/architecture.md) | システム設計 |
| [🚀 Operations Guide](docs/operations.md) | 運用ガイド・デプロイ手順 |
| [⚠️ Error Handling](docs/error-handling.md) | エラーハンドリング方針 |
| [📊 Monitoring](docs/monitoring.md) | 監視・ログ設計 |

<br />

## 🗺️ Roadmap

### ✅ Completed

- [x] 基本的な CRUD 機能
- [x] AI 要約・タグ生成
- [x] PDF / Word 対応
- [x] 共有リンク機能
- [x] バージョン履歴
- [x] ⌨️ コマンドパレット (`⌘K`)
- [x] 🌙 ダークモード対応
- [x] 🔔 トースト通知
- [x] ⌨️ キーボードショートカット
- [x] 📱 レスポンシブデザイン
- [x] 🔍 AI ベクトル検索 (pgvector + OpenAI Embeddings)
- [x] 🔒 Row Level Security (RLS) 完全実装
- [x] 📊 Sentry によるエラー監視
- [x] 📱 PWA 対応 (オフライン＆インストール可能)

### 🚧 In Progress

- [ ] 🏢 チーム / 組織対応
- [ ] 📊 バージョン差分表示
- [ ] 🌐 多言語対応 (i18n)
- [ ] 💬 AI チャットボット連携

<br />

## 📝 Product Story

### Why I Built DocuFlow

現場のエンジニアとして、何度も同じ課題にぶつかりました。

> *「あの仕様書、どこにあったっけ？」*  
> *「会議の決定事項、誰がまとめてくれたんだっけ？」*  
> *「新人に引き継ぐドキュメント、探すだけで1時間かかった…」*

Notion、Confluence、Google Drive… ツールは増えても、**情報が見つからない問題は解決しませんでした**。

DocuFlow は、この「ドキュメント迷子問題」を AI の力で解決するために作りました。

### Who Will Use This?

DocuFlow は、以下のようなチーム・シーンを想定しています：

| 🎯 ターゲット | 📋 ユースケース |
|:------------|:---------------|
| **スタートアップ (5〜30人)** | 仕様書・議事録・企画書を一元管理。検索で「あの話どこだっけ」をゼロに |
| **リモートワークチーム** | 非同期コミュニケーションの情報ハブとして。要約で長文も一瞬で把握 |
| **エンジニアチーム** | 技術ドキュメント、設計書、ポストモーテムを AI タグ付けで自動整理 |
| **フリーランス / 個人** | クライアントとの議事録や提案書を共有リンクで安全に送信 |

### Roadmap Vision

DocuFlow は「**AI が情報整理を肩代わりする世界**」を目指しています。

1. **Phase 1 (Current)**: AI 要約・タグ・ベクトル検索で「探す」を革新 ✅
2. **Phase 2**: チーム機能・権限管理で「共有する」を強化 🚧
3. **Phase 3**: AI チャットボットで「聞く」だけで情報にアクセス 🔮

<br />

---

<br />

## 🤝 Contributing

コントリビューションは大歓迎です！

<a href="https://github.com/tanasho/dooai/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=tanasho/dooai" />
</a>

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'feat: Add AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

詳細は [CONTRIBUTING.md](CONTRIBUTING.md) をご覧ください。

<br />

## 📄 License

Distributed under the MIT License. See [LICENSE](LICENSE) for more information.

<br />

---

<div align="center">

### ⭐ Star this repo if you find it useful!

<br />

**Built with passion using**

[![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com/)
[![OpenAI](https://img.shields.io/badge/OpenAI-412991?style=flat-square&logo=openai&logoColor=white)](https://openai.com/)

<br />

[Back to Top ↑](#docuflow)

</div>
