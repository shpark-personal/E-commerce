import { Module } from '@nestjs/common'
import { OrderController } from '../controller/order.controller'
import { OrderService } from '../service/order.service'
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
import { UserService } from '../service/user.service'
import { PayService } from '../service/pay.service'
import { ProductService } from '../service/product.service'
import { UserController } from '../controller/user.controller'
import { ProductController } from '../controller/product.controller'

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
  controllers: [OrderController, UserController, ProductController],
  providers: [
    UserService,
    OrderService,
    PayService,
    ProductService,
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
