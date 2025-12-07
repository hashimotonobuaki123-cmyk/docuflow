## 🧾 GitHub Releases & Issues 運用ガイド

DocuFlow の GitHub リポジトリで、**「ちゃんと運用しているプロダクト」に見せるための最小セット** をまとめます。

---

## 1. Releases タブでのリリースノート

ブラウザで GitHub リポジトリを開き、以下の手順で `v0.9.0` などのリリースを作成します。

1. 画面上部の **Releases** タブを開く
2. 「Draft a new release」をクリック
3. タグ名とタイトルを入力（例）
   - Tag: `v0.9.0`
   - Release title: `v0.9.0 – Organizations & Google Login`
4. Release notes に、`/app/whats-new` と同等の内容を貼り付けて公開

サンプル:

```markdown
## v0.9.0 – Organizations & Google Login

### Added
- Organization 機能 (RBAC: owner / admin / member)
- 組織スイッチャー / 組織設定ページ
- Google ログイン (Supabase Auth + OAuth)
- What's New ページとダッシュボードからの導線

### Improved
- ダッシュボードのインサイトカード
- セキュリティ設定ページにチェックリストを追加
```

---

## 2. Pinned Issues での「見せ方」

リポジトリの **Issues タブ** で、以下のような Issue を作成し、Pin しておくと、  
レビュー時に「開発の方向性」が一目で伝わります。

### 2.1 Roadmap Issue（例）

タイトル: `[Roadmap] DocuFlow 1.0 に向けた計画`

本文例:

```markdown
## DocuFlow Roadmap

- [ ] より細かい権限管理 (document-level permissions)
- [ ] メール通知 (SendGrid / Resend) の本番実装
- [ ] 2FA / SSO の実装（Security ADR に沿って）
- [ ] Audit Log の UI 強化
- [ ] マルチテナント課金プランの拡張
```

### 2.2 Known Issues / Limitations Issue（例）

タイトル: `[Known Issues] 現時点での制約・未対応事項`

本文例:

```markdown
## Known Issues / Limitations

- [ ] モバイル向けの UI 最適化は一部画面のみ完了
- [ ] 大容量ファイル (50MB 以上) のアップロードは想定外
- [ ] AI 要約のモデル/プロンプトは一部ハードコードされており、管理 UI は未提供
```

これら 2 件を Pin しておくことで、「改善の余地も含めて整理されている」ことを示せます。

---

## 3. Projects / Boards（必要なら）

余力があれば、GitHub Projects で簡易カンバンを作り、

- Todo
- In Progress
- Done

の 3 列で Issue を並べておくと、「チームでもすぐ開発を回せそう」という印象を与えられます。


