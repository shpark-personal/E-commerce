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

  async charge(userId: string, amount: number): Promise<PointResult> {
    return await this.userRepository.charge(userId, amount)
  }

  async getPoint(userId: string): Promise<PointResult> {
    return await this.userRepository.get(userId)
  }

  async getDetail(productId: number): Promise<ProductDetailResult> {
    const detailInfo = await this.productRepository.getProduct(productId)
    const stockInfo = await this.stockRepository.getStock(productId)
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

  async order(userId: string, products: ProductItem[]): Promise<SimpleResult> {
    if (!ValidIdChecker(userId))
      return Promise.resolve({ errorcode: Errorcode.InvalidRequest })
    let lack = false
    let total = 0
    await products.map(async item => {
      const result = await this.stockRepository.enoughStock(
        item.id,
        item.quantity,
      )
      if (!result) {
        lack = true
        return
      }
      return this.productRepository.getProduct(item.id).then(o => {
        total += o.product.price * item.quantity
        console.log(
          `p : ${o.product.price}, amt : ${item.quantity}, t : ${total}`,
        )
      })
    })
    if (lack) return Promise.resolve({ errorcode: Errorcode.OutOfStock })

    const user = await this.userRepository.get(userId)
    if (user.point < total) {
      return Promise.resolve({ errorcode: Errorcode.LackOfPoint })
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
    await this.stockRepository.updateByOrder(orderForm)
    await this.orderRepository.create(orderForm)
    return Promise.resolve({ errorcode: Errorcode.Success })
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

    // FIXME
    // 같은 아이디로 다른 인스턴스에서 접근하여 point를 사용하려고할 때
    // 현재 user point 100
    // A : 주문 70 -> OK
    // B : 주문 50 -> OK   ---- 여기에서 주문 가능하다고 했지만
    // A : 사용 70 -> OK
    // B : 사용 50 -> FAIL ---- 여기에서 실패할 수 있다 -> USER의 혼돈...
    await this.userRepository.use(userId, order.payment)
    await this.productRepository.updateSales(new Date(), order.products)
    return { errorcode: Errorcode.Success }
  }

  async getRankedProducts(
    time: Date,
    period: number,
    top: number,
  ): Promise<ProductsResult> {
    return {
      errorcode: Errorcode.Success,
      products: await this.productRepository.getSales(time, period, top),
    }
  }
}
