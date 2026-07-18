import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Payment } from './entities/payment.entity'
import { PaymentsService } from './payments.service'
import { PaymentsController } from './payments.controller'
import { ProductsModule } from '../products/products.module'
import { OrdersModule } from '../orders/orders.module'

@Module({
  imports: [TypeOrmModule.forFeature([Payment]), ProductsModule, OrdersModule],
  controllers: [PaymentsController],
  providers: [PaymentsService],
})
export class PaymentsModule {}
