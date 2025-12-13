import { redirect } from "next/navigation";

/**
 * 英語ページは別サイトで提供する方針に変更。
 * このリポジトリでは日本語専用に固定し、/en へのアクセスはトップへ誘導する。
 */
export default function HomeEn() {
  redirect("/");
}
