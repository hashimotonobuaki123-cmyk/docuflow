import * as Sentry from "@sentry/nextjs";

type CaptureLevel = "fatal" | "error" | "warning" | "info" | "debug";
type CaptureEventLevel = "info" | "warning" | "error";

export type SentryContext = {
  tags?: Record<string, string>;
  extra?: Record<string, unknown>;
  user?: { id: string; email?: string };
  fingerprint?: string[];
};

export type SentryEventContext = SentryContext & {
  /**
   * 互換用: 旧 `captureEvent(message, data)` の data を受け取れるようにする
   * （内部では extra にマージされます）
   */
  data?: Record<string, unknown>;
};

function isEventContext(v: unknown): v is SentryEventContext {
  if (!v || typeof v !== "object") return false;
  const o = v as Record<string, unknown>;
  return (
    "tags" in o || "extra" in o || "user" in o || "fingerprint" in o || "data" in o
  );
}

/**
 * エラーをSentryに送信するユーティリティ
 */
export function captureError(
  error: Error | unknown,
  context?: {
    tags?: Record<string, string>;
    extra?: Record<string, unknown>;
    user?: { id: string; email?: string };
    level?: CaptureLevel;
  }
) {
  if (process.env.NODE_ENV !== "production") {
    console.error("[Sentry] Error captured:", error);
    return;
  }

  Sentry.withScope((scope) => {
    if (context?.tags) {
      Object.entries(context.tags).forEach(([key, value]) => {
        scope.setTag(key, value);
      });
    }

    if (context?.extra) {
      Object.entries(context.extra).forEach(([key, value]) => {
        scope.setExtra(key, value);
      });
    }

    if (context?.user) {
      scope.setUser(context.user);
    }

    if (context?.level) {
      scope.setLevel(context.level);
    }

    if (error instanceof Error) {
      Sentry.captureException(error);
    } else {
      Sentry.captureException(new Error(String(error)));
    }
  });
}

/**
 * カスタムイベントをSentryに送信
 */
export function captureEvent(
  message: string,
  dataOrContext?: Record<string, unknown> | SentryEventContext,
  level: CaptureEventLevel = "info",
) {
  const context: SentryEventContext | undefined = isEventContext(dataOrContext)
    ? dataOrContext
    : dataOrContext
      ? { data: dataOrContext }
      : undefined;

  const mergedExtra: Record<string, unknown> | undefined = context
    ? { ...(context.extra ?? {}), ...(context.data ?? {}) }
    : undefined;

  if (process.env.NODE_ENV !== "production") {
    console.log(`[Sentry Event] ${level}: ${message}`, {
      tags: context?.tags,
      extra: mergedExtra,
      fingerprint: context?.fingerprint,
      user: context?.user ? { id: context.user.id } : undefined,
    });
    return;
  }

  Sentry.withScope((scope) => {
    if (context?.tags) {
      Object.entries(context.tags).forEach(([key, value]) => {
        scope.setTag(key, value);
      });
    }

    if (context?.user) {
      scope.setUser(context.user);
    }

    if (context?.fingerprint) {
      scope.setFingerprint(context.fingerprint);
    }

    Sentry.captureMessage(message, {
      level,
      extra: mergedExtra,
    });
  });
}

/**
 * ユーザー情報をSentryに設定
 */
export function setUser(user: { id: string; email?: string } | null) {
  if (process.env.NODE_ENV !== "production") {
    console.log("[Sentry] Set user:", user);
    return;
  }

  if (user) {
    Sentry.setUser(user);
  } else {
    Sentry.setUser(null);
  }
}

/**
 * トランザクションを開始（パフォーマンス計測用）
 */
export function startTransaction(
  name: string,
  op: string
): Sentry.Span | undefined {
  if (process.env.NODE_ENV !== "production") {
    console.log(`[Sentry] Start transaction: ${op} - ${name}`);
    return undefined;
  }

  return Sentry.startInactiveSpan({
    name,
    op,
  });
}

/**
 * APIエラーをキャプチャするヘルパー
 */
export function captureApiError(
  endpoint: string,
  error: Error | unknown,
  extra?: {
    method?: string;
    statusCode?: number;
    requestBody?: unknown;
  }
) {
  captureError(error, {
    tags: {
      type: "api_error",
      endpoint,
      method: extra?.method || "unknown",
    },
    extra: {
      statusCode: extra?.statusCode,
      requestBody: extra?.requestBody,
    },
    level: "error",
  });
}

/**
 * AI関連のエラーをキャプチャするヘルパー
 */
export function captureAiError(
  operation: string,
  error: Error | unknown,
  extra?: {
    model?: string;
    inputLength?: number;
    tokensUsed?: number;
  }
) {
  captureError(error, {
    tags: {
      type: "ai_error",
      operation,
      model: extra?.model || "gpt-4.1-mini",
    },
    extra: {
      inputLength: extra?.inputLength,
      tokensUsed: extra?.tokensUsed,
    },
    level: "error",
  });
}

/**
 * 認証エラーをキャプチャするヘルパー
 */
export function captureAuthError(
  action: string,
  error: Error | unknown,
  extra?: {
    userId?: string;
    email?: string;
  }
) {
  captureError(error, {
    tags: {
      type: "auth_error",
      action,
    },
    extra: {
      userId: extra?.userId,
      // メールアドレスはプライバシー保護のためマスク
      email: extra?.email ? `${extra.email.slice(0, 3)}***` : undefined,
    },
    level: "warning",
  });
}









