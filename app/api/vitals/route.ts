import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "edge";

type VitalsPayload = {
  name: string;
  value: number;
  rating: "good" | "needs-improvement" | "poor";
  delta: number;
  id: string;
  navigationType: string;
  url: string;
  userAgent: string;
  timestamp: number;
};

/**
 * Web Vitalsデータを受信してSupabaseに保存
 */
export async function POST(req: NextRequest) {
  try {
    const payload: VitalsPayload = await req.json();

    // 開発環境ではログのみ
    if (process.env.NODE_ENV !== "production") {
      console.log("[Web Vitals]", payload);
      return NextResponse.json({ success: true });
    }

    // Supabaseに保存（テーブルがない場合はスキップ）
    if (supabaseAdmin) {
      await supabaseAdmin.from("web_vitals").insert({
        metric_name: payload.name,
        metric_value: payload.value,
        rating: payload.rating,
        url: payload.url,
        user_agent: payload.userAgent,
        created_at: new Date(payload.timestamp).toISOString(),
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to save web vitals:", error);
    return NextResponse.json({ error: "Failed to save vitals" }, { status: 500 });
  }
}



