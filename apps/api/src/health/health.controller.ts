import { Controller, Get, HttpCode, ServiceUnavailableException } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { InjectDataSource } from '@nestjs/typeorm'
import { SkipThrottle } from '@nestjs/throttler'
import { DataSource } from 'typeorm'
import { Public } from '../common/decorators/public.decorator'
import { ReadinessService } from './readiness.service'

const REQUIRED_TABLES = ['users', 'products', 'plans']

@ApiTags('health')
@Controller('health')
@Public()
@SkipThrottle() // probe traffic must never count against the global rate limit
export class HealthController {
  constructor(
    @InjectDataSource() private readonly db: DataSource,
    private readonly readiness: ReadinessService
  ) {}

  /**
   * Liveness — process-only, NEVER touches the DB. This is the CONTAINER
   * HEALTHCHECK: a transient DB blip must never mark the process unhealthy and
   * restart-loop it. Returns 200 as long as the event loop can answer.
   */
  @Get('live')
  @HttpCode(200)
  live() {
    return { status: 'ok', timestamp: new Date().toISOString() }
  }

  /**
   * Readiness — DB + schema aware. Returns HTTP 503 while draining for
   * shutdown, when the DB is unreachable, or when core tables are missing. The
   * deploy health-check / load balancer polls this to decide whether to route
   * traffic, so a DB-less or half-migrated instance is held out of rotation.
   */
  @Get('ready')
  async ready() {
    const timestamp = new Date().toISOString()

    if (this.readiness.isDraining) {
      throw new ServiceUnavailableException({ status: 'draining', timestamp })
    }

    try {
      await this.db.query('SELECT 1')
    } catch {
      throw new ServiceUnavailableException({
        status: 'degraded',
        checks: { database: 'unreachable' },
        timestamp,
      })
    }

    let rows: Array<{ tablename: string }>
    try {
      rows = await this.db.query(
        `SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename = ANY($1)`,
        [REQUIRED_TABLES]
      )
    } catch {
      throw new ServiceUnavailableException({
        status: 'degraded',
        checks: { database: 'ok', schema: 'schema check failed' },
        timestamp,
      })
    }

    const found = new Set(rows.map((r) => r.tablename))
    const missing = REQUIRED_TABLES.filter((t) => !found.has(t))
    if (missing.length > 0) {
      throw new ServiceUnavailableException({
        status: 'degraded',
        checks: { database: 'ok', schema: `missing tables: ${missing.join(', ')}` },
        timestamp,
      })
    }

    return { status: 'ok', checks: { database: 'ok', schema: 'ok' }, timestamp }
  }

  /** Alias for GET /api/health — liveness semantics (always 200). */
  @Get()
  @HttpCode(200)
  check() {
    return { status: 'ok', timestamp: new Date().toISOString() }
  }
}
