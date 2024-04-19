import { Column, Entity, PrimaryColumn } from 'typeorm'
import { ProductItem } from './Product'

@Entity()
export class User {
  @PrimaryColumn()
  id: string

  @Column()
  point: number
}

@Entity()
export class ProductEntity {
  @PrimaryColumn()
  id: number

  @Column()
  name: string

  @Column()
  price: number
}

@Entity()
export class StockEntity {
  @PrimaryColumn()
  id: number

  @Column()
  quantity: number
}

@Entity()
export class RemainStockEntity {
  @PrimaryColumn()
  orderId: string

  @Column()
  productId: number

  @Column()
  quantity: number
}

@Entity()
export class OrderEntity {
  @PrimaryColumn()
  id: string

  @Column()
  userId: string

  @Column()
  products: ProductItem[]

  @Column()
  payment: number

  @Column()
  createTime: Date
}

@Entity()
export class PaymentEntity {
  @PrimaryColumn()
  id: string

  @Column()
  userId: string

  @Column()
  orderId: string

  @Column()
  createTime: Date
}

@Entity()
export class SalesEntity {
  @PrimaryColumn()
  date: string

  @PrimaryColumn()
  id: number

  @Column()
  quantity: number
}
