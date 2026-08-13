/**
 * 🔄 ADVANCED API RETRY UTILITY WITH EXPONENTIAL BACKOFF + JITTER + IDEMPOTENCY KEY + CIRCUIT BREAKER
 */

import { globalCircuitBreaker } from './circuitBreaker';

export interface RetryOptions {
  maxRetries?: number;      // Số lần tự động thử lại tối đa (Mặc định: 3)
  initialDelayMs?: number;  // Độ trễ ban đầu ms (Mặc định: 500ms)
  backoffFactor?: number;   // Bội số lùi thời gian (Mặc định: 2)
  enableJitter?: boolean;   // Kích hoạt độ trễ ngẫu nhiên chống Retry Storm (Mặc định: true)
  onRetry?: (attempt: number, error: any) => void;
}

/**
 * Hàm tạo Idempotency Key dạng UUID v4 ngẫu nhiên
 */
export function generateIdempotencyKey(): string {
  return 'idempotency-' + Date.now() + '-' + Math.random().toString(36).substring(2, 9);
}

export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  retryOptions: RetryOptions = {}
): Promise<Response> {
  // ⚡ 1. KIỂM TRA CIRCUIT BREAKER (CẦU DAO NGẮT TỰ ĐỘNG)
  if (!globalCircuitBreaker.allowRequest()) {
    throw new Error('⚡ [Circuit Breaker] Cầu dao đang MỞ (OPEN). Máy chủ đang tạm ngắt để phục hồi. Request bị từ chối sớm (Fail-Fast).');
  }

  const maxRetries = retryOptions.maxRetries ?? 3;
  const initialDelayMs = retryOptions.initialDelayMs ?? 500;
  const backoffFactor = retryOptions.backoffFactor ?? 2;
  const enableJitter = retryOptions.enableJitter ?? true;

  // 🔑 2. ĐÍNH KÈM IDEMPOTENCY KEY CHO CÁC REQUEST THAY ĐỔI DỮ LIỆU (POST, PATCH, PUT, DELETE)
  const headers = new Headers(options.headers || {});
  const method = (options.method || 'GET').toUpperCase();
  if (['POST', 'PATCH', 'PUT', 'DELETE'].includes(method) && !headers.has('X-Idempotency-Key')) {
    headers.set('X-Idempotency-Key', generateIdempotencyKey());
  }

  const fetchOptions: RequestInit = {
    ...options,
    headers,
  };

  let lastError: any;
  let delay = initialDelayMs;

  for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
    try {
      const response = await fetch(url, fetchOptions);

      // Nếu HTTP Response OK
      if (response.ok) {
        globalCircuitBreaker.recordSuccess();
        return response;
      }

      // Lỗi Client 4xx (trừ 429 Too Many Requests) -> Không retry, ghi nhận và trả về response
      if (response.status >= 400 && response.status < 500 && response.status !== 429) {
        globalCircuitBreaker.recordSuccess();
        return response;
      }

      // Lỗi Server 5xx hoặc 429 -> Coi là lỗi tạm thời (Transient Fault), kích hoạt Retry
      throw new Error(`HTTP Error Status: ${response.status} ${response.statusText}`);
    } catch (err) {
      lastError = err;
      globalCircuitBreaker.recordFailure();

      // Nếu chưa hết số lần retry -> Chờ và tự động thử lại
      if (attempt <= maxRetries) {
        if (retryOptions.onRetry) {
          retryOptions.onRetry(attempt, err);
        }

        // 🎲 Tính toán độ trễ có Jitter ngẫu nhiên (chống Retry Storm)
        let actualDelay = delay;
        if (enableJitter) {
          // Jitter: Dao động ngẫu nhiên ±25% xung quanh giá trị delay chuẩn
          const jitterMultiplier = 0.75 + Math.random() * 0.5;
          actualDelay = Math.floor(delay * jitterMultiplier);
        }

        await new Promise((resolve) => setTimeout(resolve, actualDelay));
        delay *= backoffFactor; // Exponential Backoff
      }
    }
  }

  throw lastError;
}
