import { Injectable } from '@nestjs/common'
import { PointResult, ProductResult, StockResult } from '../models/Result'
import { Errorcode } from '../models/Enums'
import { ProductEntity, StockEntity, User } from '../models/Entities'
import {
  IProductRepository,
  IStockRepository,
  IUserRepository,
} from './mall.interface'
import { ValidIdChecker, ValidPointChecker } from '../etc/helper'

@Injectable()
export class TestRepository
  implements IUserRepository, IProductRepository, IStockRepository
{
  constructor() {
    this.insertSeedProducts()
  }
  private readonly userTable: Map<string, User> = new Map()
  private readonly productTable: Map<number, ProductEntity> = new Map()
  private readonly stockTable: Map<number, StockEntity> = new Map()

  // USER REPOSITORY
  charge(id: string, point: number): PointResult {
    if (!ValidIdChecker(id)) return { errorcode: Errorcode.InvalidRequest }
    if (!ValidPointChecker(point)) return { errorcode: Errorcode.InvalidAmount }

    const userPoint = { id: id, point: point }
    let ec = Errorcode.Success
    try {
      this.userTable.set(id, userPoint)
    } catch {
      ec = Errorcode.InvalidRequest
    } finally {
      const updated = this.userTable.get(id) ?? { id: id, point: 0 }
      return { errorcode: ec, point: updated.point }
    }
  }

  get(id: string): PointResult {
    if (!ValidIdChecker(id)) return { errorcode: Errorcode.InvalidRequest }
    const info = this.userTable.get(id)
    if (info == null) return { errorcode: Errorcode.InvalidRequest }
    return { errorcode: Errorcode.Success, point: info.point }
  }

  // PRODUCT REPOSITORY
  insertSeedProducts(): void {
    for (let i = 1; i < 6; i++) {
      this.productTable.set(i, {
        id: i,
        name: `product_${i}`,
      } as ProductEntity)

      this.stockTable.set(i, {
        id: i,
        quantity: 10,
      } as StockEntity)
    }

    //fixme : delete
    // console.log(this.productTable.size)
  }

  async getProduct(id: number): Promise<ProductResult> {
    //fixme : delete
    // console.log('-------------------')
    // console.log(this.productTable.size)

    const product: ProductEntity = this.productTable.get(id)
    if (product == null) return { errorcode: Errorcode.InvalidRequest }
    return {
      errorcode: Errorcode.Success,
      product: { id: product.id, name: product.name },
    }
  }

  // STOCK REPOSITORY
  getStock(id: number): StockResult {
    const stock: StockEntity = this.stockTable.get(id)
    if (stock == null) return { errorcode: Errorcode.InvalidRequest }
    return { errorcode: Errorcode.Success, quantity: stock.quantity }
  }

  enoughStock(id: number, amount: number): boolean {
    const stock: StockEntity = this.stockTable.get(id)
    return stock.quantity < amount
  }
}
