/**
 * リトライロジック
 * ネットワークエラーや一時的な障害に対して自動的に再試行
 */

type RetryOptions = {
  maxAttempts?: number;
  delayMs?: number;
  backoff?: "linear" | "exponential";
  onRetry?: (attempt: number, error: Error) => void;
};

/**
 * 指定された関数を成功するまでリトライ
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    delayMs = 1000,
    backoff = "exponential",
    onRetry,
  } = options;

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (attempt === maxAttempts) {
        throw error;
      }

      // リトライコールバック
      if (onRetry) {
        onRetry(attempt, lastError);
      }

      // 待機時間を計算
      const delay =
        backoff === "exponential"
          ? delayMs * Math.pow(2, attempt - 1)
          : delayMs * attempt;

      // 次の試行まで待機
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

/**
 * Fetch APIにリトライ機能を追加
 */
export async function fetchWithRetry(
  url: string,
  options?: RequestInit,
  retryOptions?: RetryOptions
): Promise<Response> {
  return withRetry(async () => {
    const response = await fetch(url, options);

    // サーバーエラー（5xx）の場合はリトライ
    if (response.status >= 500) {
      throw new Error(`Server error: ${response.status}`);
    }

    return response;
  }, retryOptions);
}

/**
 * オフライン検知
 */
export function isOnline(): boolean {
  return typeof navigator !== "undefined" ? navigator.onLine : true;
}

/**
 * オンラインになるまで待機
 */
export function waitForOnline(): Promise<void> {
  return new Promise((resolve) => {
    if (isOnline()) {
      resolve();
      return;
    }

    const handleOnline = () => {
      window.removeEventListener("online", handleOnline);
      resolve();
    };

    window.addEventListener("online", handleOnline);
  });
}

/**
 * オフライン対応のfetch
 */
export async function fetchWithOfflineSupport(
  url: string,
  options?: RequestInit,
  retryOptions?: RetryOptions
): Promise<Response> {
  // オフラインの場合は待機
  if (!isOnline()) {
    console.log("Offline detected, waiting for connection...");
    await waitForOnline();
  }

  return fetchWithRetry(url, options, retryOptions);
}

/**
 * キューに追加して後で実行（オフライン時）
 */
type QueuedRequest = {
  id: string;
  url: string;
  options?: RequestInit;
  timestamp: number;
};

class RequestQueue {
  private queue: QueuedRequest[] = [];
  private processing = false;

  add(url: string, options?: RequestInit): string {
    const id = `${Date.now()}-${Math.random()}`;
    this.queue.push({ id, url, options, timestamp: Date.now() });
    this.processQueue();
    return id;
  }

  private async processQueue() {
    if (this.processing || this.queue.length === 0 || !isOnline()) {
      return;
    }

    this.processing = true;

    while (this.queue.length > 0 && isOnline()) {
      const request = this.queue[0];

      try {
        await fetch(request.url, request.options);
        this.queue.shift(); // 成功したら削除
      } catch (error) {
        console.error("Failed to process queued request:", error);
        break; // エラーの場合は一旦停止
      }
    }

    this.processing = false;
  }

  // オンラインになったら自動的にキューを処理
  startAutoProcess() {
    window.addEventListener("online", () => {
      this.processQueue();
    });
  }
}

export const requestQueue = new RequestQueue();



