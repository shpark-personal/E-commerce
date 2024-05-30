import { Inject, Injectable } from '@nestjs/common'
import { ProductItem } from '../models/Product'
import { Errorcode } from '../models/Enums'
import {
  IORDER_REPOSITORY,
  IOrderRepository,
  IPRODUCT_REPOSITORY,
  IProductRepository,
  ISTOCK_REPOSITORY,
  IStockRepository,
} from '../repository/mall.interface'
import { ToEntity, ValidIdChecker } from '../etc/helper'
import { OrderEntity } from '../models/Entities'
import { SimpleResult } from '../models/Result'

@Injectable()
export class OrderService {
  constructor(
    @Inject(IPRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,

    @Inject(ISTOCK_REPOSITORY)
    private readonly stockRepository: IStockRepository,

    @Inject(IORDER_REPOSITORY)
    private readonly orderRepository: IOrderRepository,
  ) {}

  async order(userId: string, products: ProductItem[]): Promise<SimpleResult> {
    if (!ValidIdChecker(userId))
      return Promise.resolve({ errorcode: Errorcode.UnknownError })
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
    await this.stockRepository.keepStock(orderForm)
    await this.orderRepository.createOrder(orderForm)
    return Promise.resolve({ errorcode: Errorcode.Success })
  }
}
