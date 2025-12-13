import { redirect } from "next/navigation";

/**
 * 英語デモページは別サイトで提供する方針に変更。
 * このリポジトリでは日本語専用に固定し、/demo/en はトップへ誘導する。
 */
export default function EnglishDemoPage() {
  redirect("/");
}


