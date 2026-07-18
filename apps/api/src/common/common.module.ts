import { Global, Module } from '@nestjs/common'
import { RevalidateService } from './revalidate.service'

/** Global so feature modules can inject RevalidateService without importing anything. */
@Global()
@Module({
  providers: [RevalidateService],
  exports: [RevalidateService],
})
export class CommonModule {}
