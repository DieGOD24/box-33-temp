import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import type { AppConfig } from '../config/configuration'

const TIMEOUT_MS = 3000

/**
 * Fire-and-forget ISR revalidation. After a content/product mutation the
 * services call `revalidate(['content'])` / `revalidate(['products'])` and the
 * public web app re-fetches the tagged data on its next request. A slow or
 * broken web app must NEVER fail the mutation, so this never throws and never
 * blocks the caller.
 */
@Injectable()
export class RevalidateService {
  private readonly logger = new Logger(RevalidateService.name)

  constructor(private readonly config: ConfigService<AppConfig, true>) {}

  revalidate(tags: string[]): void {
    const webUrl = this.config.get('webUrl', { infer: true })
    const secret = this.config.get('revalidationSecret', { infer: true })
    if (!webUrl || !secret) return

    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
    void fetch(`${webUrl.replace(/\/$/, '')}/api/revalidate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret, tags }),
      signal: controller.signal,
    })
      .then((res) => {
        if (!res.ok) this.logger.warn(`Revalidate [${tags.join(', ')}] → HTTP ${res.status}`)
      })
      .catch((err: unknown) => {
        this.logger.warn(
          `Revalidate [${tags.join(', ')}] failed: ${err instanceof Error ? err.message : String(err)}`
        )
      })
      .finally(() => clearTimeout(timer))
  }
}
