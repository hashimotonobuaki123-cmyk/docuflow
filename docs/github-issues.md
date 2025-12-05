# GitHub Issues - 作成予定チケット

以下の Issue を GitHub で作成してください。  
`gh auth login` で認証後、コマンドで一括作成も可能です。

---

## Issue 1: ベクトル検索（pgvector）の導入

**タイトル**: `feat: ベクトル検索（pgvector）の導入`

**ラベル**: `enhancement`, `feature`

**本文**:
```markdown
## 概要
ドキュメントの類似検索機能を実装するため、Supabase の pgvector 拡張を使用したベクトル検索を導入する。

## 背景
現在の全文検索では、意味的に近いドキュメントを見つけることが困難。ベクトル検索により、より精度の高い検索体験を提供できる。

## 実装案
- [ ] Supabase で pgvector 拡張を有効化
- [ ] documents テーブルに embedding カラムを追加
- [ ] ドキュメント保存時に OpenAI Embeddings API で埋め込みベクトルを生成
- [ ] 類似検索 API エンドポイントを実装
- [ ] UI に類似ドキュメント表示機能を追加

## 参考
- [Supabase Vector](https://supabase.com/docs/guides/ai/vector-columns)
- [OpenAI Embeddings](https://platform.openai.com/docs/guides/embeddings)
```

---

## Issue 2: バージョン差分表示機能

**タイトル**: `feat: ドキュメントバージョン間の差分表示`

**ラベル**: `enhancement`, `feature`

**本文**:
```markdown
## 概要
ドキュメントの編集履歴において、バージョン間の差分を視覚的に表示する機能を追加する。

## 背景
現在はバージョン履歴は閲覧できるが、何が変更されたかを確認するには手動で比較する必要がある。

## 実装案
- [ ] diff ライブラリ（diff-match-patch または jsdiff）を導入
- [ ] バージョン比較 API を実装
- [ ] 差分表示コンポーネントを作成（追加：緑、削除：赤）
- [ ] バージョン履歴画面に差分表示ボタンを追加

## UI イメージ
- 追加された行: 緑背景
- 削除された行: 赤背景
- 変更なし: 通常表示

## 参考
- [jsdiff](https://github.com/kpdecker/jsdiff)
- [diff-match-patch](https://github.com/google/diff-match-patch)
```

---

## Issue 3: チーム・組織機能の実装

**タイトル**: `feat: チーム/組織でのドキュメント共有機能`

**ラベル**: `enhancement`, `feature`

**本文**:
```markdown
## 概要
チームや組織単位でドキュメントを共有・管理できる機能を実装する。

## 背景
現在は個人単位でのドキュメント管理のみ。チームでの共同作業をサポートすることで、ビジネス利用の幅が広がる。

## 実装案
### フェーズ1: 基本機能
- [ ] organizations テーブルの作成
- [ ] organization_members テーブルの作成
- [ ] 組織作成・招待フロー
- [ ] 組織内ドキュメント一覧

### フェーズ2: 権限管理
- [ ] ロール定義（owner, admin, member, viewer）
- [ ] ドキュメント単位の権限設定
- [ ] RLS ポリシーの拡張

### フェーズ3: コラボレーション
- [ ] コメント機能
- [ ] メンション通知
- [ ] アクティビティフィード

## データベース設計
- organizations: id, name, slug, created_at
- organization_members: org_id, user_id, role, joined_at
- documents に org_id カラムを追加（nullable）
```

---

## Issue 4: 多言語対応（i18n）

**タイトル**: `feat: 多言語対応（i18n）の実装`

**ラベル**: `enhancement`, `i18n`

**本文**:
```markdown
## 概要
DocuFlow を多言語対応し、日本語以外のユーザーも利用できるようにする。

## 対応言語（初期）
- [x] 日本語（現在）
- [ ] 英語
- [ ] 中国語（簡体字）

## 実装案
- [ ] next-intl または react-i18next の導入
- [ ] 翻訳ファイルの整備（messages/ja.json, messages/en.json）
- [ ] 言語切り替え UI の追加
- [ ] ユーザー設定での言語保存
- [ ] AI 要約の言語対応（入力言語に応じた出力）

## 翻訳対象
- UI テキスト
- エラーメッセージ
- メール通知
- ヘルプドキュメント

## 参考
- [next-intl](https://next-intl-docs.vercel.app/)
- [react-i18next](https://react.i18next.com/)
```

---

## Issue 5: パフォーマンス改善

**タイトル**: `perf: Lighthouse スコア改善（目標90点以上）`

**ラベル**: `performance`, `enhancement`

**本文**:
```markdown
## 概要
Lighthouse のパフォーマンススコアを 90 点以上に改善する。

## 現状の課題
- [ ] 画像の最適化が不十分
- [ ] JavaScript バンドルサイズが大きい
- [ ] 初期ロード時の不要なスクリプト

## 改善案
### 画像最適化
- [ ] next/image の活用
- [ ] WebP / AVIF フォーマットの採用
- [ ] 適切な width/height の指定

### バンドルサイズ削減
- [ ] 動的インポートの活用
- [ ] Tree shaking の確認
- [ ] 不要な依存関係の削除

### Core Web Vitals
- [ ] LCP: 最大コンテンツの表示を 2.5 秒以内に
- [ ] FID: 初回入力遅延を 100ms 以内に
- [ ] CLS: レイアウトシフトを 0.1 以下に

### その他
- [ ] フォントの最適化（font-display: swap）
- [ ] プリロード / プリフェッチの活用
- [ ] Service Worker によるキャッシュ最適化

## 計測方法
- Lighthouse CI を GitHub Actions に追加
- 定期的なパフォーマンス計測

## 参考
- [web.dev/performance](https://web.dev/performance/)
- [Next.js Performance](https://nextjs.org/docs/pages/building-your-application/optimizing)
```

---

## Issue 6: アクセシビリティ改善

**タイトル**: `a11y: アクセシビリティの改善`

**ラベル**: `accessibility`, `enhancement`

**本文**:
```markdown
## 概要
WCAG 2.1 Level AA に準拠したアクセシビリティ改善を行う。

## 改善項目
### キーボード操作
- [ ] すべてのインタラクティブ要素がキーボードでアクセス可能
- [ ] フォーカス順序が論理的
- [ ] フォーカスインジケーターが視認可能

### スクリーンリーダー対応
- [ ] 適切な ARIA ラベルの追加
- [ ] ランドマーク（header, main, nav）の設定
- [ ] 動的コンテンツの通知（aria-live）

### 色・コントラスト
- [ ] テキストとの背景のコントラスト比 4.5:1 以上
- [ ] 色だけに依存しない情報伝達
- [ ] フォーカス状態の視認性

### フォーム
- [ ] ラベルとフィールドの関連付け
- [ ] エラーメッセージの明確化
- [ ] 必須項目の明示

## テストツール
- [ ] axe DevTools でのテスト
- [ ] NVDA / VoiceOver でのテスト
- [ ] キーボードのみでの操作テスト

## 参考
- [WCAG 2.1](https://www.w3.org/TR/WCAG21/)
- [a11y-101](https://a11y-101.com/)
```

---

## 一括作成コマンド

`gh auth login` で認証後、以下のコマンドで作成できます：

```bash
# Issue 1
gh issue create --title "feat: ベクトル検索（pgvector）の導入" --label "enhancement" --body-file docs/issues/vector-search.md

# Issue 2
gh issue create --title "feat: ドキュメントバージョン間の差分表示" --label "enhancement" --body-file docs/issues/version-diff.md

# ... 以下同様
```

または GitHub Web UI から直接作成してください。

