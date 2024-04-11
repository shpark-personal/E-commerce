import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

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
