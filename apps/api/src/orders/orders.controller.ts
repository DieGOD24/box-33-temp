import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Query } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { IsIn } from 'class-validator'
import { OrdersService } from './orders.service'

class UpdateOrderStatusDto {
  @IsIn(['paid', 'delivered', 'cancelled'])
  status: string
}

@ApiTags('orders')
@Controller('admin/orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  list(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.ordersService.adminList(
      page ? parseInt(page, 10) : undefined,
      limit ? parseInt(limit, 10) : undefined
    )
  }

  @Patch(':id/status')
  updateStatus(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateOrderStatusDto) {
    return this.ordersService.updateStatus(id, dto.status)
  }
}
