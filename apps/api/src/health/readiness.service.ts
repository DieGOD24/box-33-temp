import { Injectable } from '@nestjs/common'

/**
 * Process-wide readiness flag. Flipped by the SIGTERM/SIGINT handler in main.ts
 * so GET /api/health/ready starts returning 503 BEFORE the HTTP server closes.
 * That lets the proxy / deploy health-gate stop routing new traffic to this
 * instance, draining the cutover gracefully.
 */
@Injectable()
export class ReadinessService {
  private draining = false

  startDraining(): void {
    this.draining = true
  }

  get isDraining(): boolean {
    return this.draining
  }
}
