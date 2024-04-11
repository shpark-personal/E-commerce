import { Injectable } from '@nestjs/common'
import { PointResult, ProductResult } from '../models/Result'
import { Errorcode } from '../models/Enums'
import { ProductEntity, User } from '../models/Entities'
import { IProductRepository, IUserRepository } from './mall.interface'
import { ValidIdChecker, ValidPointChecker } from '../etc/helper'

@Injectable()
export class TestRepository implements IUserRepository, IProductRepository {
  private readonly userTable: Map<string, User> = new Map()
  private readonly productTable: Map<number, ProductEntity> = new Map()

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
        quantity: 10,
      } as ProductEntity)
    }

    //fixme : delete
    console.log(this.productTable.size)
  }

  async getDetail(id: number): Promise<ProductResult> {
    this.insertSeedProducts()
    //fixme : delete
    console.log('-------------------')
    console.log(this.productTable.size)

    const product: ProductEntity = this.productTable.get(id)
    if (product == null) return { errorcode: Errorcode.InvalidRequest }
    // check
    // ProductResult의 Product와 table의 ProductEntity 구조가 같아 에러가 발생하지 않지만,
    // config 설정으로 엄격한 타입 검사를 할 수 있다.
    return { errorcode: Errorcode.Success, product: product }
  }
}
