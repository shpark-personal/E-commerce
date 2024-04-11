import { Module } from '@nestjs/common'
import { MallController } from '../controller/mall.controller'
import { MallService } from '../service/mall.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from '../models/Entities'
import { UserRepository } from '../repository/user.repository'
import {
  IPRODUCT_REPOSITORY,
  IUSER_REPOSITORY,
} from '../repository/mall.interface'
import { ProductRepository } from '../repository/product.repository'

@Module({
  imports: [TypeOrmModule.forFeature([User, UserRepository])],
  controllers: [MallController],
  providers: [
    MallService,
    {
      provide: IUSER_REPOSITORY,
      useClass: UserRepository,
    },
    {
      provide: IPRODUCT_REPOSITORY,
      useClass: ProductRepository,
    },
  ],
})
export class MallModule {}
