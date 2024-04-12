import { Injectable } from '@nestjs/common'
import { PointResult, ProductResult, StockResult } from '../models/Result'
import { Errorcode } from '../models/Enums'
import {
  OrderEntity,
  PaymentEntity,
  ProductEntity,
  RemainStockEntity,
  StockEntity,
  User,
} from '../models/Entities'
import {
  IOrderRepository,
  IProductRepository,
  IStockRepository,
  IUserRepository,
} from './mall.interface'
import { ValidIdChecker, ValidPointChecker } from '../etc/helper'

@Injectable()
export class TestRepository
  implements
    IUserRepository,
    IProductRepository,
    IStockRepository,
    IOrderRepository
{
  constructor() {
    this.insertSeedProducts()
    this.insertSeedUsers()
  }
  private readonly userTable: Map<string, User> = new Map()
  private readonly productTable: Map<number, ProductEntity> = new Map()
  private readonly stockTable: Map<number, StockEntity> = new Map()
  private readonly remainStockTable: RemainStockEntity[] = []
  private readonly orderTable: Map<string, OrderEntity> = new Map()
  private readonly paymentTable: Map<string, PaymentEntity> = new Map()

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
  async getProduct(id: number): Promise<ProductResult> {
    //fixme : delete
    // console.log('-------------------')
    // console.log(this.productTable.size)

    const product: ProductEntity = this.productTable.get(id)
    if (product == null) return { errorcode: Errorcode.InvalidRequest }
    return {
      errorcode: Errorcode.Success,
      product: { id: product.id, name: product.name, price: product.price },
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
    return stock.quantity > amount
  }

  updateByOrder(order: OrderEntity): void {
    const products = order.products
    for (let i = 0; i < products.length; i++) {
      const item = products[i]
      this.stockTable.set(item.id, {
        id: item.id,
        quantity: this.stockTable.get(item.id).quantity - item.amount,
      })

      const rs: RemainStockEntity = {
        orderId: order.id,
        productId: item.id,
        quantity: item.amount,
      }
      this.remainStockTable.push(rs)
    }
  }

  updateByPay(orderId: string): void {
    const remainStocks = this.remainStockTable.filter(r => r.orderId == orderId)
    if (remainStocks.length > 0) {
      // fixme : 성능 개선
      for (let i = this.remainStockTable.length - 1; i >= 0; i--) {
        if (remainStocks.includes(this.remainStockTable[i])) {
          this.remainStockTable.splice(i, 1)
        }
      }
    }
  }

  // ORDER REPOSITORY
  create(order: OrderEntity): void {
    this.orderTable.set(order.id, order)
  }

  createPayment(payment: PaymentEntity): void {
    this.paymentTable.set(payment.id, payment)
  }

  // SEED
  private insertSeedProducts(): void {
    for (let i = 1; i < 6; i++) {
      this.productTable.set(i, {
        id: i,
        name: `product_${i}`,
        price: 1000,
      } as ProductEntity)

      this.stockTable.set(i, {
        id: i,
        quantity: 10,
      } as StockEntity)
    }

    //fixme : delete
    // console.log(this.productTable.size)
  }

  private insertSeedUsers(): void {
    this.userTable.set('userA', { id: 'userA', point: 10000 })
  }
}
