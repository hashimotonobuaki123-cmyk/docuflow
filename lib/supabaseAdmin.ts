import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let client: SupabaseClient | null = null;

if (supabaseUrl && serviceRoleKey) {
  // 管理用クライアント（サーバーサイド専用）。auth.admin を使うために service_role キーを利用する。
  client = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
} else {
  // service_role キーが未設定でもアプリ全体が落ちないようにしつつ、ログだけ出す
  console.warn(
    "[supabaseAdmin] NEXT_PUBLIC_SUPABASE_URL または SUPABASE_SERVICE_ROLE_KEY が設定されていないため、管理用クライアントは無効です（アカウント削除機能は使えません）。",
  );
}

export const supabaseAdmin = client;
