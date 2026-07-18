import { Body, Controller, Get, HttpCode, Param, Post, Query } from '@nestjs/common'
import { Throttle } from '@nestjs/throttler'
import { ApiTags } from '@nestjs/swagger'
import type { PaymentStatus } from '@box33/types'
import { Public } from '../common/decorators/public.decorator'
import { PaymentsService, type WompiEventPayload } from './payments.service'
import { CheckoutDto } from './dto/checkout.dto'

@ApiTags('payments')
@Controller()
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Public()
  @Throttle({ default: { ttl: 60_000, limit: 6 } })
  @Post('payments/checkout')
  checkout(@Body() dto: CheckoutDto) {
    return this.paymentsService.checkout(dto)
  }

  @Public()
  @Get('payments/:reference/status')
  getStatus(@Param('reference') reference: string) {
    return this.paymentsService.getStatus(reference)
  }

  /** Wompi events webhook — signature-verified inside the service. */
  @Public()
  @Post('payments/wompi/events')
  @HttpCode(200)
  async webhook(@Body() payload: WompiEventPayload): Promise<{ received: boolean }> {
    await this.paymentsService.handleWebhookEvent(payload)
    return { received: true }
  }

  @Get('admin/payments')
  adminList(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: PaymentStatus
  ) {
    return this.paymentsService.adminList(
      page ? parseInt(page, 10) : undefined,
      limit ? parseInt(limit, 10) : undefined,
      status
    )
  }
}
