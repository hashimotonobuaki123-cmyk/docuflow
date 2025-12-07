# Contributing to DocuFlow

DocuFlow へのコントリビューションありがとうございます！このドキュメントでは、プロジェクトへの貢献方法を説明します。

## 目次

- [行動規範](#行動規範)
- [開発環境のセットアップ](#開発環境のセットアップ)
- [開発フロー](#開発フロー)
- [コーディング規約](#コーディング規約)
- [コミットメッセージ](#コミットメッセージ)
- [プルリクエスト](#プルリクエスト)
- [テスト](#テスト)

## 行動規範

このプロジェクトに参加するすべての人は、敬意を持って協力し、建設的なフィードバックを提供することが期待されます。

## 開発環境のセットアップ

### 必要な環境

- Node.js 22.x 以上
- npm または yarn
- Git

### セットアップ手順

```bash
# リポジトリをクローン
git clone https://github.com/AyumuKobayashiproducts/docuflow.git
cd docuflow

# 依存関係をインストール
npm install

# 環境変数を設定
cp .env.example .env.local
# .env.local を編集して必要な環境変数を設定

# 開発サーバーを起動
npm run dev
```

### 推奨ツール

- **VSCode** + 以下の拡張機能:
  - ESLint
  - Prettier
  - Tailwind CSS IntelliSense
  - GitLens

## 開発フロー

### 1. Issue を作成または確認

- 新機能や修正を行う前に、関連する Issue が存在するか確認
- 存在しない場合は、新しい Issue を作成して議論

### 2. ブランチを作成

```bash
# 最新の main を取得
git checkout main
git pull origin main

# 新しいブランチを作成
git checkout -b feat/your-feature-name
# または
git checkout -b fix/your-bug-fix
```

**ブランチ命名規則**:
- `feat/` - 新機能
- `fix/` - バグ修正
- `docs/` - ドキュメント
- `refactor/` - リファクタリング
- `test/` - テスト追加・修正
- `chore/` - その他の変更

### 3. 変更を実装

```bash
# コードを変更
# ...

# 変更をステージング
git add .

# コミット
git commit -m "feat: add new feature description"
```

### 4. テストを実行

```bash
# 単体テスト
npm test

# E2Eテスト
npm run test:e2e

# Lint
npm run lint

# Type check
npm run type-check
```

### 5. プッシュしてプルリクエストを作成

```bash
# ブランチをプッシュ
git push origin feat/your-feature-name

# GitHubでプルリクエストを作成
```

## コーディング規約

### TypeScript

```typescript
// ✅ Good
interface User {
  id: string;
  name: string;
  email: string;
}

function getUserById(id: string): Promise<User | null> {
  // implementation
}

// ❌ Bad
function getUserById(id) {
  // implementation
}
```

### React コンポーネント

```tsx
// ✅ Good
type ButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary";
};

export function Button({ children, onClick, variant = "primary" }: ButtonProps) {
  return (
    <button className={`btn btn-${variant}`} onClick={onClick}>
      {children}
    </button>
  );
}

// ❌ Bad
export function Button(props: any) {
  return <button {...props} />;
}
```

### CSS / Tailwind

- globals.css のデザインシステムを活用
- カスタムクラスは globals.css に追加
- インラインスタイルは避ける

```tsx
// ✅ Good
<button className="btn btn-primary">Click</button>

// ❌ Bad
<button style={{ background: "green", padding: "10px" }}>Click</button>
```

### ファイル構成

```
app/
  ├── (feature)/
  │   ├── page.tsx          # ページコンポーネント
  │   ├── loading.tsx       # ローディング状態
  │   └── error.tsx         # エラー状態
  ├── api/
  │   └── (endpoint)/
  │       └── route.ts      # APIルート
components/
  └── ComponentName.tsx     # 再利用可能なコンポーネント
lib/
  └── utilityName.ts        # ユーティリティ関数
```

## コミットメッセージ

[Conventional Commits](https://www.conventionalcommits.org/) 形式を採用:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type

- `feat`: 新機能
- `fix`: バグ修正
- `docs`: ドキュメント
- `style`: コードフォーマット
- `refactor`: リファクタリング
- `test`: テスト追加・修正
- `chore`: ビルドプロセスやツールの変更

### 例

```bash
feat(auth): add social login support

- Add Google OAuth integration
- Add GitHub OAuth integration
- Update login page UI

Closes #123
```

## プルリクエスト

### PRテンプレート

```markdown
## 概要
<!-- 何を実装したか簡潔に説明 -->

## 変更内容
- [ ] 機能A を追加
- [ ] バグB を修正
- [ ] ドキュメントC を更新

## テスト
<!-- テスト方法を記載 -->

## スクリーンショット
<!-- UIの変更がある場合は画像を添付 -->

## チェックリスト
- [ ] テストを追加・更新した
- [ ] ドキュメントを更新した
- [ ] Lintエラーがない
- [ ] 既存のテストが通る
```

### レビュープロセス

1. CI/CDパイプラインが通ることを確認
2. 最低1人のレビューアーの承認が必要
3. コメントへの対応後、マージ可能

## テスト

### 単体テスト

```bash
# すべてのテストを実行
npm test

# 特定のファイルのみ
npm test -- path/to/test.test.ts

# ウォッチモード
npm test -- --watch
```

### E2Eテスト

```bash
# Headlessモード
npm run test:e2e

# UIモード
npm run test:e2e:ui

# 特定のテストのみ
npm run test:e2e -- --grep "login flow"
```

### テストの書き方

```typescript
// lib/utils.test.ts
import { describe, it, expect } from "vitest";
import { formatDate } from "./utils";

describe("formatDate", () => {
  it("should format date correctly", () => {
    const date = new Date("2024-01-01");
    expect(formatDate(date)).toBe("2024/01/01");
  });

  it("should handle invalid date", () => {
    expect(formatDate(null)).toBe(null);
  });
});
```

## よくある質問

### Q: どの Issue から始めればいい？

A: `good first issue` ラベルがついた Issue がおすすめです。

### Q: 大きな機能を追加したい

A: まず Issue を作成して、設計を議論してから実装を始めてください。

### Q: バグを見つけた

A: Issue を作成し、以下の情報を含めてください:
- 再現手順
- 期待される動作
- 実際の動作
- 環境情報

## コミュニティ

- **GitHub Discussions**: 質問や議論
- **Issue Tracker**: バグ報告や機能提案

## ライセンス

このプロジェクトに貢献することで、あなたのコントリビューションが MIT ライセンスの下でライセンスされることに同意したものとみなされます。

---

貢献してくださりありがとうございます！🎉
