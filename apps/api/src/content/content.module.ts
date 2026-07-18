import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ContentController } from './content.controller'
import { ContentService } from './content.service'
import { Challenge } from './entities/challenge.entity'
import { Plan } from './entities/plan.entity'
import { Podium } from './entities/podium.entity'
import { Schedule } from './entities/schedule.entity'
import { SiteSettings } from './entities/site-settings.entity'
import { Wod } from './entities/wod.entity'

@Module({
  imports: [TypeOrmModule.forFeature([SiteSettings, Wod, Challenge, Podium, Schedule, Plan])],
  controllers: [ContentController],
  providers: [ContentService],
  exports: [ContentService],
})
export class ContentModule {}
