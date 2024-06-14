import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm'
import { Injectable } from '@nestjs/common'
import {
  OrderEntity,
  PaymentEntity,
  ProductEntity,
  ProductItemEntity,
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
      host: process.env.POSTGRES_HOST || 'localhost',
      port: parseInt(process.env.POSTGRES_PORT, 10) || 5433 || 5432,
      username: process.env.POSTGRES_USER || 'postgres' || 'root',
      password: process.env.POSTGRES_PASSWORD || 'admin' || 'password',
      database: process.env.POSTGRES_DB || 'mall',
      entities: [
        User,
        ProductEntity,
        StockEntity,
        RemainStockEntity,
        OrderEntity,
        PaymentEntity,
        SalesEntity,
        ProductItemEntity,
      ],
      synchronize: true,
      logging: true,
    } as TypeOrmModuleOptions
  }
}
