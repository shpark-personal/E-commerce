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
import { OrderEntity, PaymentEntity } from '../models/Entities'

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

  order(userId: string, products: ProductItem[]): Promise<SimpleResult> {
    if (!ValidIdChecker(userId))
      return Promise.resolve({ errorcode: Errorcode.InvalidRequest })
    let lack = false
    let total = 0
    const promises = products.map(item => {
      if (!this.stockRepository.enoughStock(item.id, item.amount)) {
        lack = true
        return Promise.resolve()
      } else {
        return this.productRepository.getProduct(item.id).then(o => {
          total += o.product.price * item.amount
          console.log(
            `p : ${o.product.price}, amt : ${item.amount}, t : ${total}`,
          )
        })
      }
    })

    return Promise.all(promises).then(() => {
      if (lack) {
        return { errorcode: Errorcode.OutOfStock }
      }

      const user = this.userRepository.get(userId)
      if (user.point < total) {
        return { errorcode: Errorcode.LackOfPoint } as SimpleResult
      }

      console.log(`point: ${user.point}, total: ${total}`)
      const date = new Date()
      const orderForm: OrderEntity = {
        id: `${date}`,
        userId: userId,
        products: products,
        payment: total,
        createTime: date,
      }
      this.stockRepository.updateByOrder(orderForm)
      this.orderRepository.create(orderForm)
      return { errorcode: Errorcode.Success } as SimpleResult
    })
  }

  async pay(userId: string, orderId: string): Promise<SimpleResult> {
    if (!ValidIdChecker(userId)) return { errorcode: Errorcode.InvalidRequest }
    // fixme : 결제 실패 or 취소 or 토큰 만료
    const date = new Date()
    const paymentForm: PaymentEntity = {
      id: `${date}`,
      userId: userId,
      orderId: orderId,
      createTime: date,
    }
    this.stockRepository.updateByPay(orderId)
    this.orderRepository.createPayment(paymentForm)
    const order = await this.orderRepository.getOrder(orderId)
    // fixme : rankedproduct 전송
    return { errorcode: Errorcode.Success }
  }

  getRankedProducts(): ProductsResult {
    return { errorcode: Errorcode.Success, products: [] }
  }
}
