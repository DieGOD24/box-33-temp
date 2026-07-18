import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from '../auth/entities/user.entity'
import { SiteSettings } from '../content/entities/site-settings.entity'
import { Wod } from '../content/entities/wod.entity'
import { Challenge } from '../content/entities/challenge.entity'
import { Podium } from '../content/entities/podium.entity'
import { Schedule } from '../content/entities/schedule.entity'
import { Plan } from '../content/entities/plan.entity'
import { Product } from '../products/entities/product.entity'
import { AuthModule } from '../auth/auth.module'
import { SeedService } from './seed.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([User, SiteSettings, Wod, Challenge, Podium, Schedule, Plan, Product]),
    AuthModule,
  ],
  providers: [SeedService],
})
export class SeedModule {}
