export function calculateBackoffDelay(
  attempt: number,
  baseDelay = 1000,
  maxDelay = 30000,
  jitterFactor = 0.3,
): number {
  if (attempt <= 0) return 0;

  const exponentialDelay = baseDelay * Math.pow(2, attempt - 1);
  const cappedDelay = Math.min(exponentialDelay, maxDelay);

  const jitter = (Math.random() * 2 - 1) * jitterFactor;
  const delayWithJitter = cappedDelay * (1 + jitter);

  return Math.max(baseDelay, Math.min(maxDelay, Math.round(delayWithJitter)));
}
