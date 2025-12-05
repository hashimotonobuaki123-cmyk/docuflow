<div align="center">

<br />

# 📄 DocuFlow

### AI-Powered Document Workspace

**PDF・Word を一瞬で要約。スマートなドキュメント管理を。**

<br />

[![CI](https://img.shields.io/github/actions/workflow/status/hashimotonobuaki123-cmyk/docuflow/ci.yml?branch=main&style=for-the-badge&logo=github&label=CI)](https://github.com/hashimotonobuaki123-cmyk/docuflow/actions)
[![codecov](https://img.shields.io/codecov/c/github/hashimotonobuaki123-cmyk/docuflow?style=for-the-badge&logo=codecov&logoColor=white)](https://codecov.io/gh/hashimotonobuaki123-cmyk/docuflow)
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

[**📖 Docs**](docs/) &nbsp;&nbsp;·&nbsp;&nbsp; [**🐛 Bug Report**](https://github.com/hashimotonobuaki123-cmyk/docuflow/issues) &nbsp;&nbsp;·&nbsp;&nbsp; [**✨ Feature Request**](https://github.com/hashimotonobuaki123-cmyk/docuflow/issues)

<br />

<img src="docs/screenshots/dashboard.png" alt="DocuFlow Dashboard" width="90%" style="border-radius: 12px; box-shadow: 0 20px 40px rgba(0,0,0,0.1);" />

<br />
<br />

</div>

<br />

## 💡 About

**DocuFlow** は、AI を活用した次世代のドキュメント管理プラットフォームです。

会議メモ、仕様書、企画書などのドキュメントをドラッグ＆ドロップするだけで、AI が自動的に内容を分析し、**要約**・**タグ付け**・**タイトル生成**を実行。煩雑なドキュメント整理を劇的に効率化します。

<br />

<div align="center">

| 🎯 課題 | ✨ DocuFlow の解決策 |
|:---:|:---:|
| ドキュメントが増えると探せない | AI が自動でタグ付け & 全文検索 |
| 要約を書くのが面倒 | GPT-4 が 3〜5 行で自動要約 |
| PDF・Word の中身が検索できない | テキスト抽出して検索可能に |
| 共有が手間 | ワンクリックで共有リンク発行 |

</div>

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

### 🔗 One-Click Share

共有リンクをワンクリックで発行。認証不要で閲覧可能な公開ビュー。いつでも停止可能。

</td>
<td width="33%" valign="top">

### 📝 Version History

編集履歴を自動保存。過去バージョンをいつでも確認でき、変更の追跡が容易に。

</td>
</tr>
<tr>
<td width="33%" valign="top">

### ⌨️ Command Palette

`⌘K` で開くコマンドパレット。Notion/Linear風のモダンなナビゲーションを実現。

</td>
<td width="33%" valign="top">

### 🌙 Dark Mode

ライト / ダーク / システム設定の 3 モード対応。目に優しいテーマ切り替え。

</td>
<td width="33%" valign="top">

### 🔔 Toast Notifications

操作結果をリアルタイム通知。成功・エラー・警告を美しいトーストで表示。

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

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# OpenAI
OPENAI_API_KEY=your-openai-api-key

# Optional: Account deletion
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

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

### 🚧 In Progress

- [ ] 🏢 チーム / 組織対応
- [ ] 🔍 ベクトル検索 (pgvector)
- [ ] 📊 バージョン差分表示
- [ ] 🌐 多言語対応 (i18n)

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
