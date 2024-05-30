import { Injectable } from '@nestjs/common'
import { PointResult, ProductResult, StockResult } from '../models/Result'
import { Errorcode } from '../models/Enums'
import {
  OrderEntity,
  PaymentEntity,
  ProductEntity,
  RemainStockEntity,
  SalesEntity,
  StockEntity,
  User,
} from '../models/Entities'
import {
  IOrderRepository,
  IProductRepository,
  IStockRepository,
  IUserRepository,
} from './mall.interface'
import { ToEntity, ValidIdChecker, ValidPointChecker } from '../etc/helper'
import { Product, ProductItem } from '../models/Product'

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
    this.insertSeedSales()
  }

  private readonly userTable: Map<string, User> = new Map()
  private readonly productTable: Map<number, ProductEntity> = new Map()
  private readonly salesTable: SalesEntity[] = []
  private readonly stockTable: Map<number, StockEntity> = new Map()
  private readonly remainStockTable: RemainStockEntity[] = []
  private readonly orderTable: Map<string, OrderEntity> = new Map()
  private readonly paymentTable: Map<string, PaymentEntity> = new Map()

  // USER REPOSITORY
  async charge(id: string, point: number): Promise<PointResult> {
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

  async get(id: string): Promise<PointResult> {
    if (!ValidIdChecker(id)) return { errorcode: Errorcode.InvalidRequest }
    const info = this.userTable.get(id)
    if (info == null) return { errorcode: Errorcode.InvalidRequest }
    return { errorcode: Errorcode.Success, point: info.point }
  }

  async use(id: string, point: number): Promise<PointResult> {
    if (!ValidIdChecker(id)) return { errorcode: Errorcode.InvalidRequest }
    let ec = Errorcode.Success
    try {
      const user = this.userTable.get(id)
      user.point = user.point - point
      this.userTable.set(id, user)
    } catch {
      ec = Errorcode.InvalidRequest
    } finally {
      const updated = this.userTable.get(id)
      return { errorcode: ec, point: updated.point }
    }
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

  async updateSales(date: Date, products: ProductItem[]): Promise<void> {
    const day = date.toISOString().split('T')[0]
    const curSales = this.salesTable.filter(s => s.date == day)
    products.forEach(p => {
      const prev = curSales.find(v => v.id == p.id)
      if (prev) {
        console.log(`*** prev: ${prev.quantity}`)
        prev.quantity += p.quantity
        console.log(`*** updated: ${prev.quantity}`)
      } else {
        this.salesTable.push({ date: day, id: p.id, quantity: p.quantity })
      }
    })
  }

  async getSales(date: Date, period: number, top: number): Promise<Product[]> {
    const dates = []
    for (let i = 0; i < period; i++) {
      const currentDate = new Date(date)
      currentDate.setDate(date.getDate() - i)
      const formattedDate = currentDate.toISOString().split('T')[0]
      dates.push(formattedDate)
    }

    const filtered = this.salesTable.filter(s => dates.includes(s.date))
    const quantityById = new Map<number, number>()
    filtered.forEach(sale => {
      const id = sale.id
      const quantity = sale.quantity
      if (quantityById.has(id)) {
        quantityById.set(id, quantityById.get(id)! + quantity)
      } else {
        quantityById.set(id, quantity)
      }
    })

    const sortedByQuantityDesc = Array.from(quantityById.entries()).sort(
      (a, b) => b[1] - a[1],
    )

    const topResults = sortedByQuantityDesc.slice(0, top)
    return await topResults.map(([id]) => {
      const productEntity: ProductEntity = this.productTable.get(id)
      const product: Product = {
        id: productEntity.id,
        name: productEntity.name,
        price: productEntity.price,
      }
      return product
    })
  }

  // STOCK REPOSITORY
  async getStock(id: number): Promise<StockResult> {
    const stock: StockEntity = this.stockTable.get(id)
    if (stock == null) return { errorcode: Errorcode.InvalidRequest }
    return { errorcode: Errorcode.Success, quantity: stock.quantity }
  }

  async enoughStock(id: number, amount: number): Promise<boolean> {
    const stock: StockEntity = this.stockTable.get(id)
    console.log(`${id}/ q : ${stock.quantity}, amount : ${amount}`)
    return stock.quantity >= amount
  }

  async shiftToRemainStock(order: OrderEntity): Promise<void> {
    const products = order.products
    for (let i = 0; i < products.length; i++) {
      const item = products[i]
      this.stockTable.set(item.id, {
        id: item.id,
        quantity: this.stockTable.get(item.id).quantity - item.quantity,
      })

      const rs: RemainStockEntity = {
        orderId: order.id,
        productId: item.id,
        quantity: item.quantity,
      }
      this.remainStockTable.push(rs)
    }
  }

  async shiftToStock(order: OrderEntity): Promise<void> {
    const products = order.products
    for (let i = 0; i < products.length; i++) {
      const item = products[i]
      this.stockTable.set(item.id, {
        id: item.id,
        quantity: this.stockTable.get(item.id).quantity + item.quantity,
      })

      const rs: RemainStockEntity = {
        orderId: order.id,
        productId: item.id,
        quantity: item.quantity,
      }
      const idx = this.remainStockTable.findIndex(i => i === rs)
      if (idx !== -1) {
        this.remainStockTable.splice(idx, 1)
      }
    }
  }

  async reduceByPay(orderId: string): Promise<void> {
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
  async createOrder(order: OrderEntity): Promise<void> {
    await this.orderTable.set(order.id, order)
  }

  async deleteOrder(order: OrderEntity): Promise<void> {
    await this.orderTable.delete(order.id)
  }

  async createPayment(payment: PaymentEntity): Promise<void> {
    await this.paymentTable.set(payment.id, payment)
  }

  async getOrder(orderId: string): Promise<OrderEntity> {
    return this.orderTable.get(orderId)
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

  private insertSeedSales(): void {
    // seed로 미리 10일간 저장
    const today = new Date()
    const dates = []
    for (let i = 0; i < 10; i++) {
      const currentDate = new Date(today)
      currentDate.setDate(today.getDate() - i)
      const formattedDate = currentDate.toISOString().split('T')[0]
      dates.push(formattedDate)
    }

    // 10일동안의 임의 데이터 생성
    dates.forEach(d => {
      for (let i = 1; i < 6; i++) {
        this.salesTable.push({ date: d, id: i, quantity: i })
      }
    })
  }

  public async insertSeedOrders(date: Date): Promise<void> {
    // seed로 미리 order 저장 ( 호출할 때만 )
    const li = [
      { id: 1, quantity: 3 },
      { id: 2, quantity: 4 },
    ]
    let total = 0
    const productPromises = li.map(async p => {
      const pro = await this.getProduct(p.id)
      total += pro.product.price * p.quantity
      return ToEntity(p)
    })
    const productEntity = await Promise.all(productPromises)

    const orderForm: OrderEntity = {
      id: `${date}`,
      userId: 'userA',
      products: productEntity,
      payment: total,
      createTime: date,
    }
    await this.createOrder(orderForm)
  }
}
