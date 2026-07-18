import { Controller, Get } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { StatsService } from './stats.service'

@ApiTags('stats')
@Controller('admin/stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get()
  dashboard() {
    return this.statsService.dashboard()
  }
}
