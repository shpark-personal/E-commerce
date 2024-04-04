import { Module } from '@nestjs/common'
import { MallController } from '../controller/mall.controller'
import { MallService } from '../service/mall.service'

@Module({
  imports: [],
  controllers: [MallController],
  providers: [MallService],
})
export class MallModule {}
