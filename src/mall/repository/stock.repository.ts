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

  async getStock(id: number): Promise<StockResult> {
    return await this.stocks
      .findOne({
        where: { id: id },
      })
      .then(o => {
        return { errorcode: Errorcode.Success, product: o.quantity }
      })
      .catch(e => {
        console.log(e)
        return { errorcode: Errorcode.InvalidRequest }
      })
  }

  async enoughStock(id: number, amount: number): Promise<boolean> {
    return await this.stocks
      .findOne({
        where: { id: id },
      })
      .then(o => {
        return o.quantity >= amount
      })
      .catch(e => {
        // fixme : return 은 invalidrequest로 한다
        console.log(e)
        return false
      })
  }

  async shiftToRemainStock(order: OrderEntity): Promise<void> {
    const products = order.products
    for (let i = 0; i < products.length; i++) {
      const item = products[i]
      this.decreaseStock(item.id, item.quantity)
      const rs: RemainStockEntity = {
        orderId: order.id,
        productId: item.id,
        quantity: item.quantity,
      }
      await this.remainStocks.save(rs)
    }
  }

  async shiftToStock(order: OrderEntity): Promise<void> {
    const products = order.products
    for (let i = 0; i < products.length; i++) {
      const item = products[i]
      this.increaseStock(item.id, item.quantity)
      const rs: RemainStockEntity = {
        orderId: order.id,
        productId: item.id,
        quantity: item.quantity,
      }
      await this.remainStocks.remove(rs)
    }
  }

  async reduceByPay(orderId: string): Promise<void> {
    await this.remainStocks
      .find({
        where: { orderId: orderId },
      })
      .then(remainStocks => {
        if (remainStocks.length > 0) {
          const deletePromises = remainStocks.map(remainStock => {
            return this.remainStocks.remove(remainStock)
          })
          return Promise.all(deletePromises)
        }
      })
  }

  private decreaseStock(id: number, amount: number) {
    this.stocks
      .findOne({
        where: { id: id },
      })
      .then(o => {
        o.quantity = o.quantity - amount
      })
    // fixme : error
  }

  private increaseStock(id: number, amount: number) {
    this.stocks
      .findOne({
        where: { id: id },
      })
      .then(o => {
        o.quantity = o.quantity + amount
      })
    // fixme : error
  }
}
