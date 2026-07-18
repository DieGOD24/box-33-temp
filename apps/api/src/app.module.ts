import { Module } from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler'
import configuration, { type AppConfig } from './config/configuration'
import { CommonModule } from './common/common.module'
import { JwtAuthGuard } from './common/guards/jwt-auth.guard'
import { HealthModule } from './health/health.module'
import { AuthModule } from './auth/auth.module'
import { StorageModule } from './storage/storage.module'
import { SeedModule } from './seed/seed.module'
import { ContentModule } from './content/content.module'
import { LeadsModule } from './leads/leads.module'
import { StatsModule } from './stats/stats.module'
import { ProductsModule } from './products/products.module'
import { OrdersModule } from './orders/orders.module'
import { PaymentsModule } from './payments/payments.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 120 }]),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<AppConfig, true>) => {
        const db = config.get('db', { infer: true })
        return {
          type: 'postgres' as const,
          host: db.host,
          port: db.port,
          username: db.user,
          password: db.password,
          database: db.name,
          autoLoadEntities: true,
          synchronize: db.synchronize,
        }
      },
    }),
    CommonModule,
    HealthModule,
    AuthModule,
    StorageModule,
    ContentModule,
    LeadsModule,
    StatsModule,
    ProductsModule,
    OrdersModule,
    PaymentsModule,
    SeedModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
