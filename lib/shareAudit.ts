import { createHash } from "crypto";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

function sha256Hex(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

const RETENTION_DAYS = 90;
const CLEANUP_INTERVAL_MS = 60 * 60 * 1000; // 1 hour
let lastCleanupAt = 0;

async function cleanupOldShareAccessLogs() {
  if (!supabaseAdmin) return;
  const now = Date.now();
  if (now - lastCleanupAt < CLEANUP_INTERVAL_MS) return;
  lastCleanupAt = now;

  const cutoff = new Date(now - RETENTION_DAYS * 24 * 60 * 60 * 1000).toISOString();
  const { error } = await supabaseAdmin
    .from("share_access_logs")
    .delete()
    .lt("accessed_at", cutoff);
  if (error) {
    console.error("[shareAudit] cleanup failed:", error);
  }
}

export async function logShareAccess(params: {
  documentId: string;
  token: string;
  locale: "en" | "ja";
  ip: string | null;
  userAgent: string | null;
  referer: string | null;
}) {
  // Best-effort only. We intentionally do not fall back to anon client.
  // - We want this to work even for public viewers
  // - RLS is enabled and we expect inserts via service_role only
  if (!supabaseAdmin) return;

  const ip = (params.ip ?? "").trim();
  const ua = (params.userAgent ?? "").trim();

  const row = {
    document_id: params.documentId,
    locale: params.locale,
    token_prefix: params.token.slice(0, 8),
    ip_hash: ip ? sha256Hex(ip) : null,
    user_agent_hash: ua ? sha256Hex(ua) : null,
    referer: params.referer ? params.referer.slice(0, 1000) : null,
  };

  const { error } = await supabaseAdmin.from("share_access_logs").insert(row);
  if (error) {
    // Do not break public share UX
    console.error("[shareAudit] insert failed:", error);
  }

  // Best-effort retention enforcement
  // (keeps the table small without requiring cron / scheduled jobs)
  cleanupOldShareAccessLogs().catch(() => {});
}


