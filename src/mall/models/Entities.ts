import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'
import { ProductItem } from './Product'

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: string

  @Column()
  point: number
}

@Entity()
export class ProductEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  name: string
}

@Entity()
export class StockEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  quantity: number
}

@Entity()
export class OrderEntity {
  @PrimaryGeneratedColumn()
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
