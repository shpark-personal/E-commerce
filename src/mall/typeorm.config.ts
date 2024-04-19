import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm'
import { Injectable } from '@nestjs/common'
import {
  OrderEntity,
  PaymentEntity,
  ProductEntity,
  RemainStockEntity,
  SalesEntity,
  StockEntity,
  User,
} from './models/Entities'

@Injectable()
export class TypeormConfig implements TypeOrmOptionsFactory {
  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: 'postgres',
      host: 'localhost',
      port: 5433,
      password: 'admin',
      username: 'postgres',
      entities: [
        User,
        ProductEntity,
        StockEntity,
        RemainStockEntity,
        OrderEntity,
        PaymentEntity,
        SalesEntity,
      ],
      database: 'enrollment',
      synchronize: true,
      logging: true,
    } as TypeOrmModuleOptions
  }
}
