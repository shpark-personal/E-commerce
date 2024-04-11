/* eslint-disable @typescript-eslint/no-unused-vars */
import { Inject, Injectable } from '@nestjs/common'
import {
  PointResult,
  SimpleResult,
  ProductsResult,
  ProductDetailResult,
} from '../models/Result'
import { ProductItem } from '../models/Product'
import { Errorcode } from '../models/Enums'
import {
  IORDER_REPOSITORY,
  IOrderRepository,
  IPRODUCT_REPOSITORY,
  IProductRepository,
  ISTOCK_REPOSITORY,
  IStockRepository,
  IUSER_REPOSITORY,
  IUserRepository,
} from '../repository/mall.interface'
import { ValidIdChecker } from '../etc/helper'
import { OrderEntity } from '../models/Entities'

@Injectable()
export class MallService {
  constructor(
    @Inject(IUSER_REPOSITORY)
    private readonly userRepository: IUserRepository,

    @Inject(IPRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,

    @Inject(ISTOCK_REPOSITORY)
    private readonly stockRepository: IStockRepository,

    @Inject(IORDER_REPOSITORY)
    private readonly orderRepository: IOrderRepository,
  ) {}

  charge(userId: string, amount: number): PointResult {
    return this.userRepository.charge(userId, amount)
  }

  getPoint(userId: string): PointResult {
    return this.userRepository.get(userId)
  }

  async getDetail(productId: number): Promise<ProductDetailResult> {
    const detailInfo = await this.productRepository.getProduct(productId)
    const stockInfo = this.stockRepository.getStock(productId)
    if (detailInfo.errorcode != Errorcode.Success)
      return { errorcode: detailInfo.errorcode }
    if (stockInfo.errorcode != Errorcode.Success)
      return { errorcode: stockInfo.errorcode }
    return {
      errorcode: Errorcode.Success,
      product: detailInfo.product,
      quantity: stockInfo.quantity,
    }
  }

  order(userId: string, products: ProductItem[]): SimpleResult {
    if (!ValidIdChecker(userId)) return { errorcode: Errorcode.InvalidRequest }
    let lack = false
    for (let i = 0; i < products.length; i++) {
      const item = products[i]
      if (!this.stockRepository.enoughStock(item.id, item.amount)) {
        lack = true
        break
      }
    }
    if (lack) return { errorcode: Errorcode.OutOfStock }
    // fixme : 금액과 수량에 따라 현재 point로 결제 가능한지 확인
    const date = new Date()
    const orderForm: OrderEntity = {
      id: `${date}`,
      userId: userId,
      products: products,
      payment: 0, // fixme : 총 amount
      createTime: date,
    }
    this.orderRepository.create(orderForm)
    // stockRepository에서
    // stockTable : 재고 차감
    // remainStockTable : 재고 추가
    return { errorcode: Errorcode.Success }
  }

  pay(userId: string, products: ProductItem[]): SimpleResult {
    return { errorcode: Errorcode.Success }
  }

  getRankedProducts(): ProductsResult {
    return { errorcode: Errorcode.Success, products: [] }
  }
}
