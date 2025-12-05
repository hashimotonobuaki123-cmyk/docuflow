/**
 * 実行時に正しいサイトURLを取得する
 * 本番環境では常に本番URLを使用し、開発環境では現在のoriginを使用
 */
export function getSiteUrl(): string {
  if (typeof window !== "undefined") {
    const origin = window.location.origin;
    // 本番環境のURLを強制使用
    if (
      origin.includes("vercel.app") ||
      origin.includes("docuflow") ||
      origin.includes("localhost") === false
    ) {
      return "https://docuflow-azure.vercel.app";
    }
    // 開発環境の場合
    return origin;
  }
  // サーバーサイドの場合（フォールバック）
  return (
    process.env.NEXT_PUBLIC_SITE_URL || "https://docuflow-azure.vercel.app"
  );
}

