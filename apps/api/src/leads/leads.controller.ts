import { Body, Controller, Delete, Get, HttpCode, Post, Query } from '@nestjs/common'
import { Throttle } from '@nestjs/throttler'
import { ApiTags } from '@nestjs/swagger'
import { Public } from '../common/decorators/public.decorator'
import { LeadsService } from './leads.service'
import { CreateLeadDto } from './dto/create-lead.dto'
import { ListLeadsQueryDto } from './dto/list-leads.dto'

@ApiTags('leads')
@Controller()
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  /** Hero pre-registration form. */
  @Public()
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  @Post('leads')
  create(@Body() dto: CreateLeadDto) {
    return this.leadsService.create(dto)
  }

  @Get('admin/leads')
  list(@Query() query: ListLeadsQueryDto) {
    return this.leadsService.list(query.page, query.limit)
  }

  @Delete('admin/leads')
  @HttpCode(204)
  async clear(): Promise<void> {
    await this.leadsService.clear()
  }
}
