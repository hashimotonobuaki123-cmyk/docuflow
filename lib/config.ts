/**
 * 環境変数まわりを一箇所に集約するための小さなヘルパー。
 * - どの値が必須なのか
 * - 足りないときにどんなエラーを出すのか
 * をここで決めておくことで、運用時のトラブルシュートをしやすくする。
 */

function getEnvOrThrow(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export function getSupabasePublicEnv() {
  return {
    url: getEnvOrThrow("NEXT_PUBLIC_SUPABASE_URL"),
    anonKey: getEnvOrThrow("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  };
}

export function getOpenAIKey(): string {
  return getEnvOrThrow("OPENAI_API_KEY");
}

/**
 * service_role キーは「アカウント削除など管理系機能のみ」で利用し、
 * 未設定でもアプリ全体は落とさない方針なので、必須にはしない。
 */
export function getServiceRoleKey(): string | null {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return key && key.length > 0 ? key : null;
}
