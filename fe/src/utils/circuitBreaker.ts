/**
 * ⚡ CIRCUIT BREAKER PATTERN (CẦU DAO NGẮT TỰ ĐỘNG)
 * Ngăn chặn tình trạng Retry Storm khi Backend bị quá tải hoặc sập hoàn toàn.
 */

export const CircuitState = {
  CLOSED: 'CLOSED',
  OPEN: 'OPEN',
  HALF_OPEN: 'HALF_OPEN',
} as const;

export type CircuitStateType = typeof CircuitState[keyof typeof CircuitState];

export class CircuitBreaker {
  private state: CircuitStateType = CircuitState.CLOSED;
  private failureCount: number = 0;
  private successCount: number = 0;
  private lastStateChange: number = Date.now();

  private readonly failureThreshold: number; // Tỷ lệ thất bại (ví dụ: 5 lần liên tiếp)
  private readonly cooldownPeriodMs: number; // Thời gian mở cầu dao ngắt mạch (ví dụ: 15,000ms)

  constructor(failureThreshold: number = 4, cooldownPeriodMs: number = 15000) {
    this.failureThreshold = failureThreshold;
    this.cooldownPeriodMs = cooldownPeriodMs;
  }

  public getState(): CircuitStateType {
    // Nếu cầu dao đang OPEN và đã hết thời gian cooldown -> Chuyển sang HALF_OPEN để thử nghiệm
    if (this.state === CircuitState.OPEN && Date.now() - this.lastStateChange > this.cooldownPeriodMs) {
      this.state = CircuitState.HALF_OPEN;
      this.lastStateChange = Date.now();
      console.warn('🟡 [Circuit Breaker] Chuyển sang trạng thái HALF_OPEN. Đang gửi request thử nghiệm phục hồi...');
    }
    return this.state;
  }

  public recordSuccess(): void {
    this.failureCount = 0;
    if (this.state === CircuitState.HALF_OPEN) {
      this.successCount++;
      if (this.successCount >= 2) {
        this.state = CircuitState.CLOSED;
        this.successCount = 0;
        this.lastStateChange = Date.now();
        console.log('🟢 [Circuit Breaker] Backend đã phục hồi! Đóng cầu dao trở lại trạng thái CLOSED.');
      }
    }
  }

  public recordFailure(): void {
    this.failureCount++;
    if (this.state === CircuitState.CLOSED && this.failureCount >= this.failureThreshold) {
      this.state = CircuitState.OPEN;
      this.lastStateChange = Date.now();
      console.error(`🔴 [Circuit Breaker] Đã xảy ra ${this.failureCount} lỗi liên tiếp! NGẮT CẦU DAO (OPEN) trong ${this.cooldownPeriodMs / 1000}s để bảo vệ máy chủ.`);
    } else if (this.state === CircuitState.HALF_OPEN) {
      this.state = CircuitState.OPEN;
      this.lastStateChange = Date.now();
      console.error('🔴 [Circuit Breaker] Request thử nghiệm thất bại! Tiếp tục NGẮT CẦU DAO (OPEN).');
    }
  }

  public allowRequest(): boolean {
    const currentState = this.getState();
    if (currentState === CircuitState.OPEN) {
      return false;
    }
    return true;
  }
}

// Global Singleton Instance cho toàn bộ ứng dụng Frontend
export const globalCircuitBreaker = new CircuitBreaker(4, 15000);
