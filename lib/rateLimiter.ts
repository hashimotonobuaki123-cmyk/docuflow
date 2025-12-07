type Bucket = {
  tokens: number;
  lastRefill: number;
};

const buckets = new Map<string, Bucket>();

const DEFAULT_LIMIT = 60; // 1分あたりの最大リクエスト数（デモ用途）
const WINDOW_MS = 60 * 1000;

export function checkRateLimit(key: string, limit = DEFAULT_LIMIT): boolean {
  const now = Date.now();
  const bucket = buckets.get(key) ?? {
    tokens: limit,
    lastRefill: now,
  };

  const elapsed = now - bucket.lastRefill;
  if (elapsed > WINDOW_MS) {
    bucket.tokens = limit;
    bucket.lastRefill = now;
  }

  if (bucket.tokens <= 0) {
    buckets.set(key, bucket);
    return false;
  }

  bucket.tokens -= 1;
  buckets.set(key, bucket);
  return true;
}






