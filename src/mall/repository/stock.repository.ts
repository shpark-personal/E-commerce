import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { OrderEntity, RemainStockEntity, StockEntity } from '../models/Entities'
import { Errorcode } from '../models/Enums'
import { StockResult } from '../models/Result'
import { IStockRepository } from './mall.interface'

@Injectable()
export class StockRepository implements IStockRepository {
  constructor(
    @InjectRepository(StockEntity)
    private readonly stocks: Repository<StockEntity>,
    @InjectRepository(RemainStockEntity)
    private readonly remainStocks: Repository<RemainStockEntity>,
  ) {}

  getStock(id: number): StockResult {
    this.stocks
      .findOne({
        where: { id: id },
      })
      .then(o => {
        return { errorcode: Errorcode.Success, product: o.quantity }
      })
    return { errorcode: Errorcode.InvalidRequest }
  }

  enoughStock(id: number, amount: number): boolean {
    this.stocks
      .findOne({
        where: { id: id },
      })
      .then(o => {
        return o.quantity < amount
      })
    return false
  }

  update(order: OrderEntity): void {
    const products = order.products
    for (let i = 0; i < products.length; i++) {
      const item = products[i]
      this.decreaseStock(item.id, item.amount)
      const rs: RemainStockEntity = {
        orderId: order.id,
        productId: item.id,
        quantity: item.amount,
      }
      this.addRemainStock(rs)
    }
  }

  private decreaseStock(id: number, amount: number) {
    this.stocks
      .findOne({
        where: { id: id },
      })
      .then(o => {
        o.quantity = o.quantity - amount
      })
  }

  private addRemainStock(rs: RemainStockEntity) {
    this.remainStocks.save(rs)
  }
}
