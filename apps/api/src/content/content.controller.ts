import { Body, Controller, Get, Param, Put } from '@nestjs/common'
import type {
  Challenge,
  Plan,
  Podium,
  Schedule,
  SiteContent,
  SiteSettings,
  Wod,
} from '@box33/types'
import { Public } from '../common/decorators/public.decorator'
import { ContentService } from './content.service'
import { UpdateChallengeDto } from './dto/update-challenge.dto'
import { UpdatePlanDto } from './dto/update-plan.dto'
import { UpdatePodiumDto } from './dto/update-podium.dto'
import { UpdateScheduleDto } from './dto/update-schedule.dto'
import { UpdateSettingsDto } from './dto/update-settings.dto'
import { UpdateWodDto } from './dto/update-wod.dto'

@Controller()
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @Public()
  @Get('content')
  getContent(): Promise<SiteContent> {
    return this.contentService.getSiteContent()
  }

  @Put('admin/settings')
  updateSettings(@Body() dto: UpdateSettingsDto): Promise<SiteSettings> {
    return this.contentService.updateSettings(dto)
  }

  @Put('admin/wod')
  updateWod(@Body() dto: UpdateWodDto): Promise<Wod> {
    return this.contentService.updateWod(dto)
  }

  @Put('admin/challenge')
  updateChallenge(@Body() dto: UpdateChallengeDto): Promise<Challenge> {
    return this.contentService.updateChallenge(dto)
  }

  @Put('admin/podium')
  updatePodium(@Body() dto: UpdatePodiumDto): Promise<Podium> {
    return this.contentService.updatePodium(dto)
  }

  @Put('admin/schedule')
  updateSchedule(@Body() dto: UpdateScheduleDto): Promise<Schedule> {
    return this.contentService.updateSchedule(dto)
  }

  @Get('admin/plans')
  listPlans(): Promise<Plan[]> {
    return this.contentService.listPlans()
  }

  @Put('admin/plans/:key')
  updatePlan(@Param('key') key: string, @Body() dto: UpdatePlanDto): Promise<Plan> {
    return this.contentService.updatePlan(key, dto)
  }
}
