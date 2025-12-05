/**
 * 実行時に正しいサイトURLを取得する
 * 本番環境では常に本番URLを使用し、開発環境では現在のoriginを使用
 */
export function getSiteUrl(): string {
  // 環境変数が設定されている場合はそれを優先
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }

  if (typeof window !== "undefined") {
    const origin = window.location.origin;
    
    // 本番環境のURLを強制使用（localhost以外はすべて本番URL）
    if (!origin.includes("localhost") && !origin.includes("127.0.0.1")) {
      return "https://docuflow-azure.vercel.app";
    }
    
    // 開発環境の場合のみlocalhostを使用
    return origin;
  }
  
  // サーバーサイドの場合（フォールバック）
  return "https://docuflow-azure.vercel.app";
}

