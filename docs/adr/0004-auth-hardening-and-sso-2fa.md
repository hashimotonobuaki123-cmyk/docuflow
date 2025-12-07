# 0004 - Auth Hardening, SSO, and 2FA Strategy

## Status

Accepted

## Context

DocuFlow は Supabase Auth + RLS による認証・認可をすでに採用しているが、  
チーム / 組織向け SaaS としては、将来的な SSO や 2FA への拡張も視野に入れておく必要がある。

また、現時点ではポートフォリオ用途であり、実運用レベルの SSO / 2FA 実装までは不要だが、  
設計方針と拡張ポイントを明確にしておくことで「どこまで考えているか」を示したい。

## Decision

1. 認証基盤としては引き続き Supabase Auth（email/password）を採用する。
2. 認可は RLS + アプリ側 RBAC（owner / admin / member）で行う。
3. `/settings/security` に Security 設定画面を追加し、以下を「Coming Soon」として UI に表示する:
   - TOTP ベースの 2FA
   - Google Workspace / Microsoft Entra ID と連携した SSO
4. 詳細な設計（シーケンス / UX フロー）は `docs/security.md` 側に記述する。

## Consequences

- 面接やレビューの場で、「現時点では Supabase Auth だが、SSO / 2FA をこういうステップで導入できる」という説明がしやすくなる。
- 実装工数の大きい SSO / 2FA を無理にコードに落とさず、設計レベルでの深さを示すバランスを取れる。
- 将来本当に商用化する場合も、この方針をベースに段階的に導入していける。






