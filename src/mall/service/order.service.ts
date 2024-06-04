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
    for (const item of products) {
      const result = await this.stockRepository.enoughStock(
        item.id,
        item.quantity,
      )
      if (!result) {
        lack = true
      }

      const product = await this.productRepository.getProduct(item.id)
      total = total + product.product.price * item.quantity
      productEntity.push(ToEntity(item))
      console.log(
        `amt : ${item.quantity}, t : ${total}, p : ${productEntity.length}`,
      )
    }
    console.log(`tt : ${total}, p : ${productEntity.length}`)
    if (lack) return Promise.resolve({ errorcode: Errorcode.OutOfStock })

    const date = new Date()
    const orderForm: OrderEntity = {
      // id: `${date}`,
      id: 'xx',
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
