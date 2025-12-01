import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default async function Home() {
  const cookieStore = await cookies();
  const isAuthed = cookieStore.get("docuhub_ai_auth")?.value === "1";

  // ランディングページは不要なので、ルートは認証状態に応じてリダイレクトだけ行う
  if (isAuthed) {
    redirect("/app");
  }

  redirect("/auth/login");
}
