import { Inject, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { OrderEntity, RemainStockEntity, StockEntity } from '../models/Entities'
import { Errorcode } from '../models/Enums'
import { StockResult } from '../models/Result'
import { IStockRepository } from './mall.interface'
import Redis from 'ioredis'
import { withSpinlock } from 'src/infrastructure/redis/spinlock'

@Injectable()
export class StockRepository implements IStockRepository {
  constructor(
    @InjectRepository(StockEntity)
    private readonly stocks: Repository<StockEntity>,
    @InjectRepository(RemainStockEntity)
    private readonly remainStocks: Repository<RemainStockEntity>,
    @Inject('REDIS_CLIENT')
    private readonly redisClient: Redis,
  ) {}

  // 재고 확인
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

  // 재고 충분 여부 확인
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

  // 재고 -> 미수재고
  async keepStock(order: OrderEntity): Promise<void> {
    const products = order.products
    for (let i = 0; i < products.length; i++) {
      const item = products[i]
      await this.decreaseStock(item.id, item.quantity)
      const rs: RemainStockEntity = {
        orderId: order.id,
        productId: item.id,
        quantity: item.quantity,
      }
      await this.increaseRemainStock(rs)
    }
  }

  // 미수재고 -> 재고
  async restoreStock(order: OrderEntity): Promise<void> {
    const products = order.products
    for (let i = 0; i < products.length; i++) {
      const item = products[i]
      await this.increaseStock(item.id, item.quantity)
      // fixme : find with orderid
      const rs: RemainStockEntity = {
        orderId: order.id,
        productId: item.id,
        quantity: item.quantity,
      }
      await this.decreaseRemainStock(rs)
    }
  }

  // 미수재고 -> 출하!
  async depleteStock(orderId: string): Promise<void> {
    await this.remainStocks
      .find({
        where: { orderId: orderId },
      })
      .then(remainStocks => {
        if (remainStocks.length > 0) {
          const deletePromises = remainStocks.map(async remainStock => {
            return await this.decreaseRemainStock(remainStock)
          })
          return Promise.all(deletePromises)
        }
      })
  }

  //#region  privates
  private async decreaseStock(id: number, amount: number) {
    await withSpinlock(
      this.redisClient,
      `lock:stock:d:${id}`,
      3000,
      async () => {
        const stock = await this.stocks.findOne({ where: { id } })
        if (stock) {
          stock.quantity -= amount
          await this.stocks.save(stock)
        }
      },
    )
  }

  private async increaseStock(id: number, amount: number) {
    await withSpinlock(
      this.redisClient,
      `lock:stock:i:${id}`,
      3000,
      async () => {
        const stock = await this.stocks.findOne({ where: { id } })
        if (stock) {
          stock.quantity += amount
          await this.stocks.save(stock)
        }
      },
    )
  }

  private async increaseRemainStock(remainStock: RemainStockEntity) {
    await withSpinlock(
      this.redisClient,
      `lock:remain:i:${remainStock.orderId}:${remainStock.productId}`,
      3000,
      async () => await this.remainStocks.save(remainStock),
    )
  }

  private async decreaseRemainStock(remainStock: RemainStockEntity) {
    await withSpinlock(
      this.redisClient,
      `lock:remain:d:${remainStock.orderId}:${remainStock.productId}`,
      3000,
      async () => await this.remainStocks.remove(remainStock),
    )
  }
  //#endregion  privates
}
