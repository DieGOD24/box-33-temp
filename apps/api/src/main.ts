import 'reflect-metadata'
import { mkdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { ClassSerializerInterceptor, Logger, ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory, Reflector } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import helmet from 'helmet'
import type { NestExpressApplication } from '@nestjs/platform-express'
import { AppModule } from './app.module'
import type { AppConfig } from './config/configuration'
import { HttpExceptionFilter } from './common/filters/http-exception.filter'
import { ReadinessService } from './health/readiness.service'

const SHUTDOWN_DRAIN_MS = parseInt(process.env['SHUTDOWN_DRAIN_MS'] ?? '10000', 10)

async function bootstrap() {
  const logger = new Logger('Bootstrap')
  const app = await NestFactory.create<NestExpressApplication>(AppModule)
  const config = app.get(ConfigService<AppConfig, true>)

  app.use(helmet())
  app.enableCors({ origin: config.get('frontendUrl', { infer: true }), credentials: true })
  app.setGlobalPrefix('api')
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true })
  )
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)))
  app.useGlobalFilters(new HttpExceptionFilter())

  // Dashboard-uploaded images (products, podium photos) — served immutable
  // because filenames are content-unique (uuid per upload).
  // useStaticAssets (Nest's own API) instead of a raw express import — express
  // is a transitive dep and isn't resolvable in the pnpm-deployed runtime.
  const uploadsDir = resolve(config.get('uploadsDir', { infer: true }))
  mkdirSync(uploadsDir, { recursive: true })
  app.useStaticAssets(uploadsDir, { prefix: '/api/uploads', immutable: true, maxAge: '365d' })

  if (config.get('env', { infer: true }) !== 'production') {
    const doc = new DocumentBuilder()
      .setTitle('BOX33 API')
      .setDescription('Public site content, catalog, Wompi payments and coach dashboard')
      .setVersion('1.0')
      .addBearerAuth()
      .build()
    SwaggerModule.setup('api/docs', app, SwaggerModule.createDocument(app, doc))
  }

  // Graceful shutdown: flip readiness first so the LB drains us, then close.
  const readiness = app.get(ReadinessService)
  let shuttingDown = false
  const shutdown = (signal: string) => {
    if (shuttingDown) return
    shuttingDown = true
    logger.log(`${signal} received — draining for ${SHUTDOWN_DRAIN_MS}ms before close`)
    readiness.startDraining()
    setTimeout(() => {
      void app.close().then(() => process.exit(0))
    }, SHUTDOWN_DRAIN_MS).unref()
  }
  process.on('SIGTERM', () => shutdown('SIGTERM'))
  process.on('SIGINT', () => shutdown('SIGINT'))

  const port = config.get('port', { infer: true })
  await app.listen(port, '0.0.0.0')
  logger.log(`API listening on :${port} (env=${config.get('env', { infer: true })})`)
}

void bootstrap()
