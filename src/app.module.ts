import { Module } from '@nestjs/common'
import { MallModule } from './mall/module/mall.module'

@Module({
  imports: [MallModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
