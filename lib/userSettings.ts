import { supabase } from "./supabaseClient";

export type AISettings = {
  autoSummaryOnNew: boolean;
  autoSummaryOnUpload: boolean;
};

export const DEFAULT_AI_SETTINGS: AISettings = {
  autoSummaryOnNew: true,
  autoSummaryOnUpload: true,
};

export type ShareSettings = {
  defaultExpiresIn: "7" | "30" | "none";
};

export const DEFAULT_SHARE_SETTINGS: ShareSettings = {
  defaultExpiresIn: "7",
};

export type DashboardSettings = {
  defaultSort: "desc" | "asc" | "pinned";
  defaultShowArchived: boolean;
  defaultSharedOnly: boolean;
};

export const DEFAULT_DASHBOARD_SETTINGS: DashboardSettings = {
  defaultSort: "desc",
  defaultShowArchived: false,
  defaultSharedOnly: false,
};

function isMissingRelationError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const anyError = error as { code?: string; message?: string };
  if (anyError.code === "42P01") return true;
  if (
    anyError.message &&
    anyError.message.includes('relation "public.user_settings" does not exist')
  ) {
    return true;
  }
  return false;
}

export async function getAISettingsForUser(
  userId: string | null,
): Promise<AISettings> {
  if (!userId) return DEFAULT_AI_SETTINGS;

  const { data, error } = await supabase
    .from("user_settings")
    .select("ai_auto_summary_on_new, ai_auto_summary_on_upload")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    if (isMissingRelationError(error)) {
      console.warn(
        "[getAISettingsForUser] user_settings テーブルが存在しません。デフォルト値を使用します。",
      );
      return DEFAULT_AI_SETTINGS;
    }
    console.error("[getAISettingsForUser] 取得エラー:", error);
    return DEFAULT_AI_SETTINGS;
  }

  if (!data) {
    return DEFAULT_AI_SETTINGS;
  }

  return {
    autoSummaryOnNew:
      (data as { ai_auto_summary_on_new: boolean | null })
        .ai_auto_summary_on_new ?? DEFAULT_AI_SETTINGS.autoSummaryOnNew,
    autoSummaryOnUpload:
      (data as { ai_auto_summary_on_upload: boolean | null })
        .ai_auto_summary_on_upload ?? DEFAULT_AI_SETTINGS.autoSummaryOnUpload,
  };
}

export async function upsertAISettingsForUser(
  userId: string,
  settings: AISettings,
): Promise<void> {
  const { error } = await supabase
    .from("user_settings")
    .upsert(
      {
        user_id: userId,
        ai_auto_summary_on_new: settings.autoSummaryOnNew,
        ai_auto_summary_on_upload: settings.autoSummaryOnUpload,
      },
      {
        onConflict: "user_id",
      },
    );

  if (error) {
    console.error("[upsertAISettingsForUser] 保存エラー:", error);
    throw new Error("AI 設定の保存に失敗しました。");
  }
}

export async function getShareSettingsForUser(
  userId: string | null,
): Promise<ShareSettings> {
  if (!userId) return DEFAULT_SHARE_SETTINGS;

  const { data, error } = await supabase
    .from("user_settings")
    .select("default_share_expires_in")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    if (isMissingRelationError(error)) {
      console.warn(
        "[getShareSettingsForUser] user_settings テーブルが存在しません。デフォルト値を使用します。",
      );
      return DEFAULT_SHARE_SETTINGS;
    }
    console.error("[getShareSettingsForUser] 取得エラー:", error);
    return DEFAULT_SHARE_SETTINGS;
  }

  if (!data) {
    return DEFAULT_SHARE_SETTINGS;
  }

  const expiresIn = (data as { default_share_expires_in: string | null })
    .default_share_expires_in;

  if (expiresIn === "7" || expiresIn === "30" || expiresIn === "none") {
    return { defaultExpiresIn: expiresIn };
  }

  return DEFAULT_SHARE_SETTINGS;
}

export async function upsertShareSettingsForUser(
  userId: string,
  settings: ShareSettings,
): Promise<void> {
  const { error } = await supabase
    .from("user_settings")
    .upsert(
      {
        user_id: userId,
        default_share_expires_in: settings.defaultExpiresIn,
      },
      {
        onConflict: "user_id",
      },
    );

  if (error) {
    console.error("[upsertShareSettingsForUser] 保存エラー:", error);
    throw new Error("共有リンク設定の保存に失敗しました。");
  }
}

export async function getDashboardSettingsForUser(
  userId: string | null,
): Promise<DashboardSettings> {
  if (!userId) return DEFAULT_DASHBOARD_SETTINGS;

  const { data, error } = await supabase
    .from("user_settings")
    .select("default_sort, default_show_archived, default_shared_only")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    if (isMissingRelationError(error)) {
      console.warn(
        "[getDashboardSettingsForUser] user_settings テーブルが存在しません。デフォルト値を使用します。",
      );
      return DEFAULT_DASHBOARD_SETTINGS;
    }
    console.error("[getDashboardSettingsForUser] 取得エラー:", error);
    return DEFAULT_DASHBOARD_SETTINGS;
  }

  if (!data) {
    return DEFAULT_DASHBOARD_SETTINGS;
  }

  const sort = (data as { default_sort: string | null }).default_sort;
  const showArchived = (data as { default_show_archived: boolean | null })
    .default_show_archived;
  const sharedOnly = (data as { default_shared_only: boolean | null })
    .default_shared_only;

  return {
    defaultSort:
      sort === "desc" || sort === "asc" || sort === "pinned"
        ? sort
        : DEFAULT_DASHBOARD_SETTINGS.defaultSort,
    defaultShowArchived:
      showArchived ?? DEFAULT_DASHBOARD_SETTINGS.defaultShowArchived,
    defaultSharedOnly: sharedOnly ?? DEFAULT_DASHBOARD_SETTINGS.defaultSharedOnly,
  };
}

export async function upsertDashboardSettingsForUser(
  userId: string,
  settings: DashboardSettings,
): Promise<void> {
  const { error } = await supabase
    .from("user_settings")
    .upsert(
      {
        user_id: userId,
        default_sort: settings.defaultSort,
        default_show_archived: settings.defaultShowArchived,
        default_shared_only: settings.defaultSharedOnly,
      },
      {
        onConflict: "user_id",
      },
    );

  if (error) {
    console.error("[upsertDashboardSettingsForUser] 保存エラー:", error);
    throw new Error("ダッシュボード設定の保存に失敗しました。");
  }
}


