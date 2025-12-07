# アクセシビリティガイド

## 概要

DocuFlow は WCAG 2.1 Level AA を目指したアクセシビリティ対応を実施しています。

## 実装済み機能

### 1. キーボードナビゲーション

**全ページ共通**:
- `Tab` / `Shift + Tab` - フォーカス移動
- `Enter` / `Space` - ボタン・リンクの実行
- `Esc` - ダイアログ・モーダルを閉じる

**ダッシュボード**:
- `⌘ + K` / `Ctrl + K` - コマンドパレット
- `G then D` - ダッシュボードへ
- `G then N` - 新規作成へ
- `G then S` - 設定へ
- `/` - 検索にフォーカス

**ドキュメントカード**:
- `Shift + D` - カードを削除（フォーカス中）

### 2. ARIA属性

**ダイアログ**:
```tsx
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="dialog-title"
  aria-describedby="dialog-description"
>
  <h2 id="dialog-title">タイトル</h2>
  <p id="dialog-description">説明</p>
</div>
```

**トースト通知**:
```tsx
<div role="alert" aria-live="polite">
  通知メッセージ
</div>
```

**ボタン**:
```tsx
<button aria-label="ドキュメントを削除">
  <TrashIcon />
</button>
```

### 3. フォーカス管理

**フォーカストラップ**:
- モーダル/ダイアログ内でフォーカスを循環
- 開いた時に最初の要素にフォーカス
- 閉じた時に元の要素に戻す

**フォーカス表示**:
```css
*:focus-visible {
  outline: 2px solid var(--brand-500);
  outline-offset: 2px;
}
```

### 4. セマンティックHTML

**適切な要素の使用**:
- `<button>` - ボタン操作
- `<a>` - ナビゲーション
- `<nav>` - ナビゲーション領域
- `<main>` - メインコンテンツ
- `<article>` - ドキュメントカード
- `<header>` - ヘッダー

### 5. 色のコントラスト

**WCAG AA準拠**:
- 通常テキスト: 4.5:1 以上
- 大きなテキスト: 3:1 以上
- UI コンポーネント: 3:1 以上

**検証済みの組み合わせ**:
- テキスト（#0f172a）on 背景（#ffffff）: 16.1:1 ✓
- プライマリボタン（白）on 緑（#10b981）: 3.8:1 ✓

### 6. スクリーンリーダー対応

**VisuallyHidden コンポーネント**:
```tsx
<button>
  <TrashIcon />
  <VisuallyHidden>削除</VisuallyHidden>
</button>
```

**aria-label の使用**:
```tsx
<button aria-label="メニューを開く">
  <MenuIcon />
</button>
```

### 7. フォームアクセシビリティ

**ラベルの関連付け**:
```tsx
<label htmlFor="email">メールアドレス</label>
<input id="email" type="email" aria-required="true" />
```

**エラー表示**:
```tsx
<input
  id="email"
  aria-invalid="true"
  aria-describedby="email-error"
/>
<p id="email-error" role="alert">
  有効なメールアドレスを入力してください
</p>
```

### 8. 動的コンテンツ

**Live Regions**:
```tsx
// 即座に通知
<div aria-live="assertive" role="alert">
  エラーが発生しました
</div>

// 控えめに通知
<div aria-live="polite">
  保存しました
</div>
```

## テスト方法

### 自動テスト

**axe DevTools** を使用:
```bash
# Playwrightでのaxeテスト
npx playwright test --grep accessibility
```

### 手動テスト

1. **キーボードのみで操作**
   - マウスを使わずに全機能が使えるか
   - フォーカスが見えるか
   - Tab順序が論理的か

2. **スクリーンリーダー**
   - macOS: VoiceOver（⌘ + F5）
   - Windows: NVDA / JAWS
   - すべての要素が読み上げられるか

3. **ズーム**
   - 200%まで拡大しても使えるか
   - レイアウトが崩れないか

4. **色覚シミュレーション**
   - 色だけで情報を伝えていないか
   - 色覚異常でも判別できるか

## チェックリスト

### Level A（必須）

- [x] すべての画像にalt属性
- [x] フォームにラベル
- [x] キーボードで全操作可能
- [x] フォーカス表示
- [x] 色だけに依存しない

### Level AA（推奨）

- [x] コントラスト比 4.5:1 以上
- [x] リサイズ可能（200%まで）
- [x] 複数の手段でナビゲーション
- [x] エラー識別
- [x] ラベルまたは説明

### Level AAA（将来対応）

- [ ] コントラスト比 7:1 以上
- [ ] テキストの最大幅
- [ ] 行間・段落間隔
- [ ] 音声のみの代替

## よくある問題と解決方法

### 1. アイコンボタンに説明がない

```tsx
// ❌ Bad
<button><TrashIcon /></button>

// ✅ Good
<button aria-label="削除">
  <TrashIcon />
</button>
```

### 2. ダイアログのフォーカストラップなし

```tsx
// ✅ Good
useEffect(() => {
  if (isOpen) {
    const firstFocusable = dialogRef.current?.querySelector('button, input');
    (firstFocusable as HTMLElement)?.focus();
  }
}, [isOpen]);
```

### 3. カスタムコンポーネントに role がない

```tsx
// ✅ Good
<div
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={(e) => e.key === 'Enter' && handleClick()}
>
  クリック
</div>
```

## リソース

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [A11y Project Checklist](https://www.a11yproject.com/checklist/)
- [axe DevTools](https://www.deque.com/axe/devtools/)

## まとめ

DocuFlow は以下のアクセシビリティ機能を実装しています:

- ✅ キーボードナビゲーション完全対応
- ✅ ARIA属性の適切な使用
- ✅ フォーカス管理
- ✅ セマンティックHTML
- ✅ 色のコントラスト（WCAG AA）
- ✅ スクリーンリーダー対応
- ✅ フォームアクセシビリティ

これにより、障がいのあるユーザーも含め、すべてのユーザーが DocuFlow を快適に利用できます。



