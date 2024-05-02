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
import { ToDto, ToEntity, ValidIdChecker } from '../etc/helper'
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
    const productEntity = []
    // fixme : transacion 추가
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
        productEntity.push(ToEntity(item))
      })
    })
    if (lack) return Promise.resolve({ errorcode: Errorcode.OutOfStock })

    const date = new Date()
    const orderForm: OrderEntity = {
      id: `${date}`,
      userId: userId,
      products: productEntity,
      payment: total,
      createTime: date,
    }
    await this.stockRepository.shiftToRemainStock(orderForm)
    await this.orderRepository.createOrder(orderForm)
    return Promise.resolve({ errorcode: Errorcode.Success })
  }

  async pay(userId: string, orderId: string): Promise<SimpleResult> {
    if (!ValidIdChecker(userId)) return { errorcode: Errorcode.InvalidRequest }

    // 결제 시도
    const order = await this.orderRepository.getOrder(orderId)
    const result = await this.userRepository.use(userId, order.payment)
    if (result.errorcode !== Errorcode.Success) {
      await this.stockRepository.shiftToStock(order)
      await this.orderRepository.deleteOrder(order)
      return { errorcode: result.errorcode }
    } else {
      const date = new Date()
      const paymentForm: PaymentEntity = {
        id: `${date}`,
        userId: userId,
        orderId: orderId,
        createTime: date,
      }
      this.stockRepository.reduceByPay(orderId)
      this.orderRepository.createPayment(paymentForm)

      await this.productRepository.updateSales(
        new Date(),
        order.products.map(p => ToDto(p)),
      )
      return { errorcode: Errorcode.Success }
    }
  }

  async getRankedProducts(
    time: Date,
    period: number,
    top: number,
  ): Promise<ProductsResult> {
    return {
      products: await this.productRepository.getSales(time, period, top),
    }
  }
}
