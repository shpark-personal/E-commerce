import { Module } from '@nestjs/common'
import { MallController } from '../controller/mall.controller'
import { MallService } from '../service/mall.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import {
  OrderEntity,
  PaymentEntity,
  ProductEntity,
  RemainStockEntity,
  SalesEntity,
  StockEntity,
  User,
} from '../models/Entities'
import { UserRepository } from '../repository/user.repository'
import {
  IORDER_REPOSITORY,
  IPRODUCT_REPOSITORY,
  ISTOCK_REPOSITORY,
  IUSER_REPOSITORY,
} from '../repository/mall.interface'
import { ProductRepository } from '../repository/product.repository'
import { StockRepository } from '../repository/stock.repository'
import { OrderRepository } from '../repository/order.repository'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      UserRepository,
      StockEntity,
      RemainStockEntity,
      StockRepository,
      OrderEntity,
      PaymentEntity,
      OrderRepository,
      ProductEntity,
      SalesEntity,
      ProductRepository,
    ]),
  ],
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
    {
      provide: ISTOCK_REPOSITORY,
      useClass: StockRepository,
    },
    {
      provide: IORDER_REPOSITORY,
      useClass: OrderRepository,
    },
  ],
})
export class MallModule {}
