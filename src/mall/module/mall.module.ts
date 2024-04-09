import { Module } from '@nestjs/common'
import { MallController } from '../controller/mall.controller'
import { MallService } from '../service/mall.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from '../models/Entities'
import { UserRepository } from '../repository/user.repository'
import { IUSER_REPOSITORY } from '../repository/mall.interface'

@Module({
  imports: [TypeOrmModule.forFeature([User, UserRepository])],
  controllers: [MallController],
  providers: [
    MallService,
    {
      provide: IUSER_REPOSITORY,
      useClass: UserRepository,
    },
  ],
})
export class MallModule {}
