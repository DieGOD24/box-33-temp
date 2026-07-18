import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Product } from '../products/entities/product.entity'
import { Order } from '../orders/entities/order.entity'
import { Lead } from '../leads/entities/lead.entity'
import { OrdersModule } from '../orders/orders.module'
import { LeadsModule } from '../leads/leads.module'
import { StatsService } from './stats.service'
import { StatsController } from './stats.controller'

@Module({
  imports: [TypeOrmModule.forFeature([Product, Order, Lead]), OrdersModule, LeadsModule],
  controllers: [StatsController],
  providers: [StatsService],
})
export class StatsModule {}
