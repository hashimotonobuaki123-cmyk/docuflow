import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export const dynamic = "force-dynamic";

export async function GET() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("docuhub_ai_user_id")?.value ?? null;

  if (!userId) {
    return NextResponse.json(
      { error: "Unauthorized: missing user session" },
      { status: 401 },
    );
  }

  const [documentsRes, commentsRes, activityRes, notificationsRes] =
    await Promise.all([
      supabase
        .from("documents")
        .select("*")
        .order("created_at", { ascending: true })
        .limit(1000),
      supabase
        .from("document_comments")
        .select("*")
        .order("created_at", { ascending: true })
        .limit(1000),
      supabase
        .from("activity_logs")
        .select("*")
        .order("created_at", { ascending: true })
        .limit(2000),
      supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: true })
        .limit(500),
    ]);

  if (documentsRes.error) {
    console.error("[api/export] documents error:", documentsRes.error);
  }
  if (commentsRes.error) {
    console.error("[api/export] comments error:", commentsRes.error);
  }
  if (activityRes.error) {
    console.error("[api/export] activity error:", activityRes.error);
  }
  if (notificationsRes.error) {
    console.error("[api/export] notifications error:", notificationsRes.error);
  }

  const payload = {
    exported_at: new Date().toISOString(),
    user_id: userId,
    documents: documentsRes.data ?? [],
    document_comments: commentsRes.data ?? [],
    activity_logs: activityRes.data ?? [],
    notifications: notificationsRes.data ?? [],
  };

  const body = JSON.stringify(payload, null, 2);

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": 'attachment; filename="docuflow-export.json"',
    },
  });
}


