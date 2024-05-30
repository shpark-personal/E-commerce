import { OrderEntity, PaymentEntity } from '../models/Entities'
import { Product, ProductItem } from '../models/Product'
import { PointResult, ProductResult, StockResult } from '../models/Result'

export const IUSER_REPOSITORY = 'User Repository'
export interface IUserRepository {
  charge(id: string, point: number): Promise<PointResult>
  get(id: string): Promise<PointResult>
  use(id: string, point: number): Promise<PointResult>
}

export const IPRODUCT_REPOSITORY = 'Product Repository'
export interface IProductRepository {
  getProduct(id: number): Promise<ProductResult>
  updateSales(time: Date, products: ProductItem[]): Promise<void>
  getSales(time: Date, period: number, top: number): Promise<Product[]>
}

export const ISTOCK_REPOSITORY = 'Stock Repository'
export interface IStockRepository {
  getStock(id: number): Promise<StockResult>
  enoughStock(id: number, amount: number): Promise<boolean>
  // 일부 재고를 결제 전까지 keep함
  keepStock(order: OrderEntity): Promise<void>
  // keep한 재고를 복원함
  restoreStock(order: OrderEntity): Promise<void>
  // 재고를 결제를 통해 소진함
  depleteStock(orderId: string): Promise<void>
}

export const IORDER_REPOSITORY = 'Order Repository'
export interface IOrderRepository {
  createOrder(order: OrderEntity): Promise<void>
  deleteOrder(order: OrderEntity): Promise<void>
  createPayment(payment: PaymentEntity): Promise<void>
  getOrder(orderId: string): Promise<OrderEntity>
}
