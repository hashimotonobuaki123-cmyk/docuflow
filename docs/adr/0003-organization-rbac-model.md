# ADR 0003: Organization / Team 機能 + RBAC を導入する

## Status

Accepted

## Context

- 個人利用だけでなく、**チームでのドキュメント共有・検索** をサポートしたい。
- 「Findy 的」には、組織・権限モデルがあることで **「実務レベルの SaaS」** として評価されやすい。
- 既にユーザー単位の RLS は導入済みだが、組織単位のスコープがない。

## Decision

- `organizations`, `organization_members`, `organization_invitations` テーブルを追加。
- `documents`, `activity_logs`, `document_comments` に `organization_id` を追加し、  
  **すべての行を「個人 or 組織」に紐づくものとして扱う**。
- ロールは `owner` / `admin` / `member` を採用し、RLS で制御:
  - `owner`: 組織設定・メンバー追加/削除・ロール変更・全ドキュメント管理
  - `admin`: 組織ドキュメントの作成・編集・削除、メンバー招待（member まで）
  - `member`: 組織ドキュメントの閲覧・作成・編集（削除は制限）
- UI として:
  - ダッシュボードヘッダーに **Organization スイッチャー** を配置
  - `/settings/organizations` で組織作成・メンバー一覧・招待管理を行う。

## Consequences

### Pros

- チーム利用を前提としたマルチテナント設計になり、プロダクトの「格」が上がる。
- 将来的な有料プラン（組織ごとの課金）への展開がしやすくなる。
- 監査・ログ分析を組織単位で行えるようになる。

### Cons

- スキーマと RLS が複雑化し、テストケースも増える。
- 組織スイッチャーや設定画面など、UI の導線設計が必要。
- 将来的なプラン設計（シート数・ロールの拡張）時に再調整が発生する可能性。







