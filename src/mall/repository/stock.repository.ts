import { Inject, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DataSource, QueryRunner, Repository } from 'typeorm'
import { OrderEntity, RemainStockEntity, StockEntity } from '../models/Entities'
import { Errorcode } from '../models/Enums'
import { StockResult } from '../models/Result'
import { IStockRepository } from './mall.interface'
import Redis from 'ioredis'
import { withSpinlock } from '../../infrastructure/redis/spinlock'

@Injectable()
export class StockRepository implements IStockRepository {
  constructor(
    @InjectRepository(StockEntity)
    private readonly stocks: Repository<StockEntity>,
    @InjectRepository(RemainStockEntity)
    private readonly remainStocks: Repository<RemainStockEntity>,
    @Inject('REDIS_CLIENT')
    private readonly redisClient: Redis,
    private readonly dataSource: DataSource,
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
    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()
    try {
      const products = order.products
      for (let i = 0; i < products.length; i++) {
        const item = products[i]
        await this.decreaseStock(item.id, item.quantity, queryRunner)
        const rs: RemainStockEntity = {
          orderId: order.id,
          productId: item.id,
          quantity: item.quantity,
        }
        await queryRunner.manager.save(RemainStockEntity, rs)
        await this.increaseRemainStock(rs, queryRunner)
      }

      await queryRunner.commitTransaction()
    } catch (err) {
      await queryRunner.rollbackTransaction()
      throw err
    } finally {
      await queryRunner.release()
    }
  }

  // 미수재고 -> 재고
  async restoreStock(order: OrderEntity): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()
    const products = order.products
    for (let i = 0; i < products.length; i++) {
      const item = products[i]
      await this.increaseStock(item.id, item.quantity, queryRunner)
      // fixme : find with orderid
      const rs: RemainStockEntity = {
        orderId: order.id,
        productId: item.id,
        quantity: item.quantity,
      }
      await this.decreaseRemainStock(rs, queryRunner)
    }
  }

  // 미수재고 -> 출하!
  async depleteStock(orderId: string): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()
    await this.remainStocks
      .find({
        where: { orderId: orderId },
      })
      .then(remainStocks => {
        if (remainStocks.length > 0) {
          const deletePromises = remainStocks.map(async remainStock => {
            return await this.decreaseRemainStock(remainStock, queryRunner)
          })
          return Promise.all(deletePromises)
        }
      })
  }

  //#region  privates
  private async decreaseStock(
    id: number,
    amount: number,
    queryRunner: QueryRunner,
  ) {
    await withSpinlock(
      this.redisClient,
      `lock:stock:d:${id}`,
      3000,
      async (queryRunner: QueryRunner) => {
        const stock = await queryRunner.manager.findOne(StockEntity, {
          where: { id },
        })
        if (stock) {
          stock.quantity -= amount
          await queryRunner.manager.save(stock)
        }
      },
      queryRunner,
    )
  }

  private async increaseStock(
    id: number,
    amount: number,
    queryRunner: QueryRunner,
  ) {
    await withSpinlock(
      this.redisClient,
      `lock:stock:i:${id}`,
      3000,
      async (queryRunner: QueryRunner) => {
        const stock = await queryRunner.manager.findOne(StockEntity, {
          where: { id },
        })
        if (stock) {
          stock.quantity += amount
          await queryRunner.manager.save(stock)
        }
      },
      queryRunner,
    )
  }

  private async increaseRemainStock(
    remainStock: RemainStockEntity,
    queryRunner: QueryRunner,
  ) {
    await withSpinlock(
      this.redisClient,
      `lock:remain:i:${remainStock.orderId}:${remainStock.productId}`,
      3000,
      async (queryRunner: QueryRunner) =>
        await queryRunner.manager.save(RemainStockEntity, remainStock),
      queryRunner,
    )
  }

  private async decreaseRemainStock(
    remainStock: RemainStockEntity,
    queryRunner: QueryRunner,
  ) {
    await withSpinlock(
      this.redisClient,
      `lock:remain:d:${remainStock.orderId}:${remainStock.productId}`,
      3000,
      async (queryRunner: QueryRunner) =>
        await queryRunner.manager.remove(RemainStockEntity, remainStock),
      queryRunner,
    )
  }
  //#endregion  privates
}
