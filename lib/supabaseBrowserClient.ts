import { createClient } from "@supabase/supabase-js";

// クライアントサイドでは process.env が Next.js のビルド時に置き換えられる
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.",
  );
}

export const supabaseBrowser = createClient(supabaseUrl, supabaseAnonKey);
