import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
} from 'typeorm'

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

  @OneToMany(() => ProductItemEntity, productItem => productItem.order)
  products: ProductItemEntity[]

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

@Entity()
export class ProductItemEntity {
  @PrimaryColumn()
  id: number

  @Column()
  quantity: number

  @ManyToOne(() => OrderEntity, order => order.products)
  @JoinColumn({ name: 'orderId' })
  order: OrderEntity
}
