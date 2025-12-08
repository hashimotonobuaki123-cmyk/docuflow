<div align="center">

<br />

# 📄 DocuFlow

### AI-Powered Document Workspace

**Summarize PDFs & Word files instantly. Smart document management for modern teams.**

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

[**📖 Documentation**](docs/) &nbsp;&nbsp;·&nbsp;&nbsp; [**🐛 Bug Report**](https://github.com/AyumuKobayashiproducts/docuflow/issues) &nbsp;&nbsp;·&nbsp;&nbsp; [**✨ Feature Request**](https://github.com/AyumuKobayashiproducts/docuflow/issues)

<br />

---

</div>

## 🎯 Problem → Solution

| 🎯 Common Problem | ✨ How DocuFlow Solves It |
|:---|:---|
| Documents pile up and become impossible to find | AI tagging + vector search reduces search time by **90%** |
| No time to write summaries | GPT-4 generates **3-5 line summaries automatically** |
| Can't search inside PDF/Word files | Text extraction → full-text + semantic search |
| Sharing is tedious | **One-click public link** generation, revocable anytime |

<br />

## 🌟 Key Value Propositions

This project demonstrates three core engineering capabilities:

1. **AI × Vector Search Architecture** – Reducing document search time from minutes to seconds
2. **Production-Ready SaaS Design** – Organizations, RBAC, Billing, Analytics, and full security model
3. **Engineering Excellence** – Web Vitals, Lighthouse CI, E2E tests, OpenAPI, SDK, and comprehensive documentation

<br />

<div align="center">
<img src="docs/screenshots/dashboard.png" alt="DocuFlow Dashboard" width="90%" style="border-radius: 12px; box-shadow: 0 20px 40px rgba(0,0,0,0.1);" />
</div>

<br />

## 🎮 Try the Live Demo

<div align="center">

**👉 [https://docuflow-azure.vercel.app](https://docuflow-azure.vercel.app)**

</div>

The demo environment includes **15+ sample documents** (specs, meeting notes, proposals, reports) to explore DocuFlow's AI capabilities.

### 🔎 Quick Links for Reviewers

- `/app?lang=en` – Main dashboard (AI summaries, insights, notifications)
- `/settings/organizations?lang=en` – Organization & RBAC (Owner / Admin / Member)
- `/app/whats-new` – Development changelog and feature updates
- `/new?lang=en` – Document creation with AI processing

### 📋 Recommended Demo Flow

| Step | Action | What to Notice |
|:----:|:-------|:---------------|
| 1️⃣ | Login at `/auth/login` | Modern auth UI with password strength check |
| 2️⃣ | View dashboard at `/app?lang=en` | Document count, recent activity, AI similarity search |
| 3️⃣ | Search for **"auth"** or **"security"** | API docs, onboarding manual appear |
| 4️⃣ | Search for **"revenue"** or **"marketing"** | Monthly reports, campaign proposals appear |
| 5️⃣ | Click any document for details | AI summary, auto-tags, version history |
| 6️⃣ | Click "Create share link" | One-click public link generation |

### 🔍 Vector Search Examples

```
"auth" / "security"      → API Design Spec, Onboarding Manual
"revenue" / "marketing"  → Monthly Sales Report, Campaign Proposal
"design" / "database"    → DB Schema Doc, System Migration Proposal
"meeting" / "progress"   → Weekly MTG Notes, Kickoff Meeting Notes
```

> 💡 **Tip**: You can also search with natural language like "How does user registration work?"

<br />

## ✨ Features

<table>
<tr>
<td width="33%" valign="top">

### 🤖 AI Auto-Summary

High-accuracy auto-summarization powered by GPT-4.1-mini. Condenses documents into 3-5 lines with prompts optimized for both Japanese and English.

</td>
<td width="33%" valign="top">

### 🏷️ Smart Tagging

Analyzes document content and auto-generates up to 3 relevant tags. Makes documents easily discoverable later.

</td>
<td width="33%" valign="top">

### 📄 File Support

Drag & drop PDF and Word files. Text extraction via `pdf-parse` / `mammoth` with immediate AI processing.

</td>
</tr>
<tr>
<td width="33%" valign="top">

### 🔍 Semantic Search

Vector embeddings (OpenAI + pgvector) enable meaning-based search beyond keywords. Find related documents even with different terminology.

</td>
<td width="33%" valign="top">

### 🔐 Authentication

Email/password + Google OAuth supported. Secure token management with Supabase Auth.

</td>
<td width="33%" valign="top">

### 🔗 One-Click Share

Generate public share links instantly. No authentication required for viewing. Revocable anytime.

</td>
</tr>
<tr>
<td width="33%" valign="top">

### 🏢 Organizations & RBAC

Multi-tenant architecture with Owner/Admin/Member roles. Row Level Security enforces data isolation.

</td>
<td width="33%" valign="top">

### 🌙 Dark Mode

Light / Dark / System theme support. Eye-friendly theming with smooth transitions.

</td>
<td width="33%" valign="top">

### 📝 Version History

Auto-saves edit history. Compare any version to current content with diff highlighting.

</td>
</tr>
</table>

<br />

<div align="center">

### ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|:--------:|:-------|
| `⌘K` / `Ctrl+K` | Open command palette |
| `?` | Show shortcuts help |
| `G` `D` | Go to dashboard |
| `G` `N` | Go to new document |
| `/` | Focus search |

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

</div>

<br />

## 🎯 Quality Gates

| Metric | Target | Tool |
|:-------|:-------|:-----|
| **Lighthouse Performance** | 80+ | Lighthouse CI |
| **Lighthouse Accessibility** | 90+ | Lighthouse CI |
| **Lighthouse Best Practices** | 80+ | Lighthouse CI |
| **Lighthouse SEO** | 90+ | Lighthouse CI |
| **Unit Test Coverage** | 60%+ | Vitest + Codecov |
| **E2E Test Pass Rate** | 100% | Playwright |
| **TypeScript Strict Mode** | ✅ Enabled | tsc |
| **ESLint Errors** | 0 | ESLint |
| **Security Audit** | No High/Critical | npm audit |

### CI/CD Pipeline

```
Push → Lint → Type Check → Unit Test → Build → Security Audit → Deploy
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
│  │  • i18n locale detection                                    │    │
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
│  │    • Google OAuth      │  │   │  │  • Tag extraction      │  │
│  │    • Session mgmt      │  │   │  │  • Title generation    │  │
│  └────────────────────────┘  │   │  └────────────────────────┘  │
│  ┌────────────────────────┐  │   │  ┌────────────────────────┐  │
│  │      PostgreSQL        │  │   │  │   text-embedding-3     │  │
│  │  • documents           │  │   │  │  • Vector embeddings   │  │
│  │  • organizations       │  │   │  │  • Semantic search     │  │
│  │  • activity_logs       │  │   │  └────────────────────────┘  │
│  │  • RLS policies        │  │   └──────────────────────────────┘
│  │  • pgvector            │  │
│  └────────────────────────┘  │
└──────────────────────────────┘
```

<br />

## 🔐 Security Overview

DocuFlow is designed with **Supabase Auth + PostgreSQL RLS** for team-based document management:

- **Authentication**: Email/password & Google OAuth with Supabase Auth
- **Authorization**: RBAC with `organizations` / `organization_members` (owner / admin / member)
- **Data Isolation**: Row Level Security enabled on `documents`, `activity_logs`, `notifications`
- **Share Links**: UUID-based `share_token` for view-only access, revocable anytime
- **Audit Trail**: All critical operations logged to `activity_logs`

See `docs/security.md` for detailed security design.

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
git clone https://github.com/AyumuKobayashiproducts/docuflow.git
cd docuflow

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

# Optional: Account deletion, Stripe billing
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
STRIPE_SECRET_KEY=your-stripe-key
```

See `docs/dev-setup.md` for detailed setup instructions.

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

# Type check
npm run type-check

# Build for production
npm run build
```

<br />

## 📁 Project Structure

```
docuflow/
├── 📂 app/                     # Next.js App Router
│   ├── 📂 app/                # Dashboard & workspace
│   ├── 📂 auth/               # Authentication pages
│   ├── 📂 documents/          # Document CRUD
│   ├── 📂 new/                # Create new document
│   ├── 📂 settings/           # User & org settings
│   └── 📂 share/              # Public share view
│
├── 📂 components/             # Reusable UI components
├── 📂 lib/                    # Core utilities
│   ├── ai.ts                 # OpenAI integration
│   ├── i18n.ts               # Internationalization
│   ├── organizations.ts      # Multi-tenant logic
│   └── supabase*.ts          # Database clients
│
├── 📂 tests/                  # Unit tests (Vitest)
├── 📂 e2e/                    # E2E tests (Playwright)
├── 📂 docs/                   # Documentation
└── 📂 .github/workflows/      # CI/CD pipelines
```

<br />

## 📖 Documentation

| Document | Description |
|:---------|:------------|
| [📋 Specification](docs/spec-docuflow.md) | Feature specifications |
| [🎨 UI Flow](docs/ui-flow.md) | Screen transitions & user flows |
| [🗄️ Database Schema](docs/db-schema.md) | Table definitions & RLS |
| [🏗️ Architecture](docs/architecture.md) | System design |
| [🔐 Security](docs/security.md) | Security design & policies |
| [🚀 Operations](docs/operations.md) | Deployment & operations guide |
| [⚠️ Error Handling](docs/error-handling.md) | Error handling strategy |

<br />

## ⚖️ Non-Goals / Limitations

Explicitly stating what's out of scope:

- **Large-scale multi-tenancy (10K+ orgs)** – Currently designed for small-mid teams on a single Supabase project
- **Real-time collaborative editing** – Focus on async workflows with comments & notifications
- **AI model switching via UI** – Models configured via `.env` for stable demo experience

These are intentional design decisions, not oversights.

<br />

## 👤 Role & Responsibility

This repository is a **solo project** where I handled:

- **Product Design & UX**: "AI summary × vector search × team collaboration" concept and user flows
- **Architecture & Infrastructure**: Next.js 16 App Router, Supabase (PostgreSQL + RLS), Stripe, OpenAI integration
- **Full-Stack Implementation**: Auth, Organizations/RBAC, Notifications, Analytics, Billing, API, SDK, PWA
- **Quality Assurance**: E2E tests, Lighthouse CI, Web Vitals, Security & Operations documentation

The goal is to demonstrate how far one engineer can go in building a production-ready SaaS.

<br />

## 🗺️ Roadmap

### ✅ Completed

- [x] Core CRUD functionality
- [x] AI summarization & tagging
- [x] PDF / Word support
- [x] Share links
- [x] Version history
- [x] Command palette (`⌘K`)
- [x] Dark mode
- [x] Keyboard shortcuts
- [x] Responsive design
- [x] AI vector search (pgvector + OpenAI Embeddings)
- [x] Row Level Security (RLS)
- [x] Error monitoring (Sentry)
- [x] PWA support (offline & installable)
- [x] Full i18n (English / Japanese)
- [x] Organizations & RBAC

### 🚧 In Progress

- [ ] Usage metering per organization
- [ ] Stripe billing integration
- [ ] AI chatbot for Q&A

<br />

## 🤝 Contributing

Contributions are welcome!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'feat: Add AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

See [CONTRIBUTING.md](CONTRIBUTING.md) for details.

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

[Back to Top ↑](#-docuflow)

</div>
