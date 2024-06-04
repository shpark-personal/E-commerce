import { Inject, Injectable } from '@nestjs/common'
import { ValidIdChecker, ToDto } from '../etc/helper'
import { PaymentEntity } from '../models/Entities'
import { Errorcode } from '../models/Enums'
import { SimpleResult } from '../models/Result'
import {
  IUSER_REPOSITORY,
  IUserRepository,
  IPRODUCT_REPOSITORY,
  IProductRepository,
  ISTOCK_REPOSITORY,
  IStockRepository,
  IORDER_REPOSITORY,
  IOrderRepository,
} from '../repository/mall.interface'

@Injectable()
export class PayService {
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
  async pay(userId: string, orderId: string): Promise<SimpleResult> {
    if (!ValidIdChecker(userId)) return { errorcode: Errorcode.InvalidRequest }

    // 결제 시도
    const order = await this.orderRepository.getOrder(orderId)
    const result = await this.userRepository.use(userId, order.payment)
    console.log(result.point)
    if (result.errorcode !== Errorcode.Success) {
      await this.stockRepository.restoreStock(order)
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
      await this.stockRepository.depleteStock(orderId)
      await this.orderRepository.createPayment(paymentForm)

      const productsDto = (order.products ?? []).map(p => ToDto(p))
      await this.productRepository.updateSales(new Date(), productsDto)
      return { errorcode: Errorcode.Success }
    }
  }
}
